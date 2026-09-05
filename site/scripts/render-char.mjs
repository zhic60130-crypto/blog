// 把彩色角色 SVG 栅格化成透明背景 WebP/PNG（背景装饰用）
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
// sharp 是传递依赖（未 hoist），直接引 .pnpm 内的实体
const sharpDir = fs.readdirSync(path.resolve(import.meta.dirname, '../node_modules/.pnpm')).find(d => d.startsWith('sharp@'))
const { default: sharp } = await import(pathToFileURL(path.resolve(import.meta.dirname, `../node_modules/.pnpm/${sharpDir}/node_modules/sharp/lib/index.js`)).href)

const svg = fs.readFileSync(path.resolve(import.meta.dirname, '../src/assets/char-color.svg'))
const out = path.resolve(import.meta.dirname, '../public')

await sharp(svg, { density: 144 })
  .resize(1400)
  .webp({ quality: 82, alphaQuality: 100 })
  .toFile(path.join(out, 'bg-character.webp'))

await sharp(svg, { density: 144 })
  .resize(1400)
  .png({ palette: true })
  .toFile(path.join(out, 'bg-character.png'))

for (const f of ['bg-character.webp', 'bg-character.png']) {
  console.log(f, fs.statSync(path.join(out, f)).size, 'bytes')
}
