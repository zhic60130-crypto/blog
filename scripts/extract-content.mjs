// Extract posts/about metadata + HTML content from crawled original pages
// into theme content files (frontmatter + raw HTML body kept 1:1).
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const RECON = path.join(ROOT, 'RECON/original')
const map = JSON.parse(fs.readFileSync(path.join(RECON, 'page-map.json'), 'utf8'))

function between(html, start, end) {
  const i = html.indexOf(start)
  if (i < 0) return ''
  const j = html.indexOf(end, i + start.length)
  return html.slice(i + start.length, j < 0 ? undefined : j)
}

// Decode Cloudflare email protection
function cfEmailDecode(hex) {
  const key = parseInt(hex.slice(0, 2), 16)
  let out = ''
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key)
  return out
}
function fixCfLinks(html) {
  return html.replace(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/g, (_, hex) => `mailto:${cfEmailDecode(hex)}`)
}

const posts = []
for (const [url, file] of Object.entries(map)) {
  if (!url.startsWith('/posts/')) continue
  const h = fs.readFileSync(path.join(ROOT, file), 'utf8')
  const main = between(h, '<main', '</main>')
  const title = (main.match(/<a class="not-prose" href="[^"]*">([\s\S]*?)<\/a>/) || [])[1]?.trim() || ''
  const pubDate = (main.match(/<time>([^<]+)<\/time>/) || [])[1]
  const cat = (main.match(/<a href="\/categories\/[^"]*">\s*#\s*([^<]+?)\s*<\/a>/) || [])[1] || ''
  const body = fixCfLinks(between(main, '</header>', '</article>').trim())
  const images = [...body.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1])
  posts.push({ url, title, pubDate, cat, body, images })
}

fs.writeFileSync(path.join(RECON, 'extracted-posts.json'), JSON.stringify(posts, null, 2))

// Write content md files (no description: live site falls back to site-level desc)
const postsDir = path.join(ROOT, 'site/src/content/posts')
fs.mkdirSync(postsDir, { recursive: true })
for (const p of posts) {
  const slug = decodeURIComponent(new URL(p.url, 'https://blog.moeyua.com').pathname.replace(/^\/posts\//, '').replace(/\/$/, ''))
  const fm = [
    '---',
    `title: '${p.title.replace(/'/g, '\'\'')}'`,
    `pubDate: ${p.pubDate}`,
    'categories:',
    `  - ${p.cat}`,
    '---',
    '',
    p.body,
    '',
  ].join('\n')
  fs.writeFileSync(path.join(postsDir, `${slug}.md`), fm)
  console.log('wrote post:', slug)
}

// About page
const aboutHtml = fs.readFileSync(path.join(ROOT, map['/about/']), 'utf8')
const aboutMain = between(aboutHtml, '<main', '</main>')
const aboutDate = (aboutMain.match(/<time>([^<]+)<\/time>/) || [])[1]
const aboutBody = fixCfLinks(between(aboutMain, '<article class="prose">', '</article>').trim())
fs.writeFileSync(path.join(ROOT, 'site/src/content/spec/about.md'), `---\ntitle: ''\npubDate: ${aboutDate}\n---\n\n${aboutBody}\n`)
console.log('wrote about, date:', aboutDate)
console.log('about links:', [...aboutBody.matchAll(/href="([^"]+)"/g)].map(m => m[1]))
