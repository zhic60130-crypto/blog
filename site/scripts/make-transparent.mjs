// 把原始彩色角色图处理成透明背景并对齐线稿坐标系
// 用法: node scripts/make-transparent.mjs [输入图路径]
// 默认输入: src/assets/mascot-original.png
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const sharpDir = fs.readdirSync(path.resolve(import.meta.dirname, '../node_modules/.pnpm')).find(d => d.startsWith('sharp@'))
const { default: sharp } = await import(pathToFileURL(path.resolve(import.meta.dirname, `../node_modules/.pnpm/${sharpDir}/node_modules/sharp/lib/index.js`)).href)

const input = process.argv[2] || path.resolve(import.meta.dirname, '../src/assets/mascot-original.png')
if (!fs.existsSync(input)) {
  console.error('找不到输入图:', input)
  console.error('请把彩色角色图存到该路径（或传参数指定），再运行本脚本')
  process.exit(1)
}

// 目标盒 = 线稿 viewBox
const W = 1456
const H = 1080

const { data, info } = await sharp(input)
  .resize(W, H, { fit: 'fill' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width, height, channels } = info
const px = (x, y) => (y * width + x) * channels

// 背景色 = 四角平均
function corner(i) {
  const p = px(i % 2 ? width - 1 : 0, i < 2 ? 0 : height - 1)
  return [data[p], data[p + 1], data[p + 2]]
}
const bg = [0, 1, 2].map(c => Math.round(corner(0)[c] / 1 + corner(1)[c] / 1 + corner(2)[c] / 1 + corner(3)[c] / 1) / 4)
console.log('背景色采样:', bg)

// 洪水填充：从四条边出发，删除与背景色接近且与边界连通的像素
const tol = 60 // 容差（欧氏距离）
const removed = new Uint8Array(width * height)
const stack = []
function nearBg(x, y) {
  const p = px(x, y)
  const dr = data[p] - bg[0]
  const dg = data[p + 1] - bg[1]
  const db = data[p + 2] - bg[2]
  return dr * dr + dg * dg + db * db < tol * tol
}
for (let x = 0; x < width; x++) {
  stack.push([x, 0], [x, height - 1])
}
for (let y = 0; y < height; y++) {
  stack.push([0, y], [width - 1, y])
}
while (stack.length) {
  const [x, y] = stack.pop()
  const idx = y * width + x
  if (removed[idx] || !nearBg(x, y)) continue
  removed[idx] = 1
  if (x > 0) stack.push([x - 1, y])
  if (x < width - 1) stack.push([x + 1, y])
  if (y > 0) stack.push([x, y - 1])
  if (y < height - 1) stack.push([x, y + 1])
}

// 应用 alpha + 边缘半透明羽化（邻接被删像素且自身偏背景色的做 50%）
let removedCount = 0
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x
    const p = px(x, y)
    if (removed[idx]) {
      data[p + 3] = 0
      removedCount++
      continue
    }
    // 羽化：与删除区相邻且颜色偏背景
    const nb = (x > 0 && removed[idx - 1]) || (x < width - 1 && removed[idx + 1]) || (y > 0 && removed[idx - width]) || (y < height - 1 && removed[idx + width])
    if (nb && nearBg(x, y)) data[p + 3] = 128
  }
}
console.log('去除背景像素:', removedCount, '/', width * height)

// 清理杂散低透明度像素，避免 bbox 被撑满
for (let i = 3; i < data.length; i += channels) {
  if (data[i] < 24) data[i] = 0
}

// 对齐：把彩图内容 bbox 映射到线稿内容 bbox (32,57)-(1422,1024)，保证勾线与上色重合
let minX = width, minY = height, maxX = -1, maxY = -1
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[px(x, y) + 3] > 40) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}
console.log('彩图内容 bbox:', minX, minY, maxX, maxY)
const LINE_BOX = { x: 32, y: 57, w: 1422 - 32, h: 1024 - 57 }
const aligned = await sharp(Buffer.from(data), { raw: { width, height, channels } })
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .resize(LINE_BOX.w, LINE_BOX.h, { fit: 'fill' })
  .extend({
    left: LINE_BOX.x,
    top: LINE_BOX.y,
    right: W - LINE_BOX.x - LINE_BOX.w,
    bottom: H - LINE_BOX.y - LINE_BOX.h,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .raw()
  .toBuffer()

const out = path.resolve(import.meta.dirname, '../public')
await sharp(Buffer.from(aligned), { raw: { width: W, height: H, channels } })
  .webp({ quality: 85, alphaQuality: 100 })
  .toFile(path.join(out, 'bg-character.webp'))
await sharp(Buffer.from(aligned), { raw: { width: W, height: H, channels } })
  .png({ palette: true })
  .toFile(path.join(out, 'bg-character.png'))
for (const f of ['bg-character.webp', 'bg-character.png']) {
  console.log(f, fs.statSync(path.join(out, f)).size, 'bytes')
}
console.log('完成：静止态将显示原彩图（透明度由 CSS 控制 .14）')
