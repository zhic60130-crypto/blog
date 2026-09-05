// Webhook 自动构建服务（加固版）：
// Decap 后台提交 -> Git push -> GitHub/GitLab webhook -> 本服务验签 -> git pull + pnpm build
//
// 用法:
//   WEBHOOK_SECRET=<>=32位随机串> SITE_DIR=/path/to/site node deploy/auto-deploy.mjs
//   建议 systemd/pm2 守护，仅监听 127.0.0.1，Nginx 反代 /hook 到它
//
// 安全特性:
//   - 密钥未设置或过短直接拒绝启动
//   - GitHub: 校验 X-Hub-Signature-256 (HMAC-SHA256 真签名)
//   - GitLab: 校验 X-Gitlab-Token
//   - 通用:   X-Webhook-Secret 原始令牌
//   - 全部常量时间比较 (timingSafeEqual)，防时序攻击
//   - 请求体 1MB 上限，防内存 DoS
import { createServer } from 'node:http'
import { execSync } from 'node:child_process'
import { createHmac, timingSafeEqual } from 'node:crypto'
import path from 'node:path'

const PORT = Number(process.env.PORT || 9876)
const SECRET = process.env.WEBHOOK_SECRET || ''
const SITE_DIR = process.env.SITE_DIR || path.resolve(import.meta.dirname, '../site')
const MAX_BODY = 1024 * 1024

if (SECRET.length < 32) {
  console.error('FATAL: WEBHOOK_SECRET 必须设置且 >= 32 位（用 `openssl rand -hex 32` 生成）')
  process.exit(1)
}

function safeEqual(a, b) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) {
    timingSafeEqual(ba, ba) // 避免长度短路泄露
    return false
  }
  return timingSafeEqual(ba, bb)
}

function verify(req, body) {
  const ghSig = req.headers['x-hub-signature-256']
  if (typeof ghSig === 'string' && ghSig.startsWith('sha256=')) {
    const expect = 'sha256=' + createHmac('sha256', SECRET).update(body).digest('hex')
    return safeEqual(ghSig, expect)
  }
  const glToken = req.headers['x-gitlab-token']
  if (typeof glToken === 'string') return safeEqual(glToken, SECRET)
  const raw = req.headers['x-webhook-secret']
  if (typeof raw === 'string') return safeEqual(raw, SECRET)
  return false
}

createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/hook') {
    res.writeHead(404).end()
    return
  }
  const chunks = []
  let size = 0
  let aborted = false
  req.on('data', c => {
    size += c.length
    if (size > MAX_BODY) {
      aborted = true
      res.writeHead(413).end('payload too large')
      req.destroy()
      return
    }
    chunks.push(c)
  })
  req.on('end', () => {
    if (aborted) return
    const body = Buffer.concat(chunks)
    if (!verify(req, body)) {
      res.writeHead(403).end('bad signature')
      return
    }
    res.writeHead(200).end('rebuilding')
    try {
      console.log(`[${new Date().toISOString()}] webhook verified, rebuilding...`)
      execSync('git pull --ff-only && pnpm build', { cwd: SITE_DIR, stdio: 'inherit', timeout: 300_000 })
      console.log('build ok')
    }
    catch (e) {
      console.error('build failed:', e.message)
    }
  })
}).listen(PORT, '127.0.0.1', () => {
  console.log(`auto-deploy listening on 127.0.0.1:${PORT}, site dir: ${SITE_DIR}`)
})
