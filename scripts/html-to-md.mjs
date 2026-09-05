// Convert extracted raw-HTML post bodies back to Markdown (the original authoring format),
// so the theme's MarkdownIt-based excerpt pipeline behaves identically to the live site.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'RECON/original/extracted-posts.json'), 'utf8'))

function unescape(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
}

function textContent(s) {
  return s.replace(/<[^>]+>/g, '')
}

function inline(s) {
  s = s.replace(/<img src="([^"]*)" alt="([^"]*)"[^>]*>/g, (_, src, alt) => `![${alt}](${src})`)
  s = s.replace(/<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, t) => `[${inline(t)}](${href})`)
  s = s.replace(/<code>([\s\S]*?)<\/code>/g, (_, c) => `\`${unescape(textContent(c))}\``)
  s = s.replace(/<del>([\s\S]*?)<\/del>/g, (_, t) => `~~${inline(t)}~~`)
  s = s.replace(/<br\s*\/?>/g, '\n')
  s = s.replace(/<\/?span[^>]*>/g, '')
  s = s.replace(/<\/?(strong|em)>/g, '')
  return s.trim()
}

function blocks(html, quote = false) {
  const out = []
  let rest = html.trim()
  const push = t => out.push(t)

  while (rest.length) {
    rest = rest.trimStart()
    if (!rest) break
    let m
    if ((m = rest.match(/^<pre[^>]*data-language="([^"]*)"[^>]*><code>([\s\S]*?)<\/code>\s*<\/pre>/))) {
      push('```' + m[1] + '\n' + unescape(textContent(m[2])).replace(/\n$/, '') + '\n```')
      rest = rest.slice(m[0].length)
    }
    else if ((m = rest.match(/^<pre[^>]*><code>([\s\S]*?)<\/code>\s*<\/pre>/))) {
      push('```\n' + unescape(textContent(m[1])).replace(/\n$/, '') + '\n```')
      rest = rest.slice(m[0].length)
    }
    else if ((m = rest.match(/^<(h[2-6])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/))) {
      const level = Number(m[1][1])
      push(`${'#'.repeat(level)} ${inline(m[2])}`)
      rest = rest.slice(m[0].length)
    }
    else if ((m = rest.match(/^<blockquote>([\s\S]*?)<\/blockquote>/))) {
      const inner = blocks(m[1], true)
      push(inner)
      rest = rest.slice(m[0].length)
    }
    else if ((m = rest.match(/^<ul>([\s\S]*?)<\/ul>/))) {
      const items = [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)]
      push(items.map(i => `- ${inline(i[1])}`).join('\n'))
      rest = rest.slice(m[0].length)
    }
    else if ((m = rest.match(/^<ol>([\s\S]*?)<\/ol>/))) {
      const items = [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)]
      push(items.map((i, n) => `${n + 1}. ${inline(i[1])}`).join('\n'))
      rest = rest.slice(m[0].length)
    }
    else if ((m = rest.match(/^<hr\s*\/?>/))) {
      push('---')
      rest = rest.slice(m[0].length)
    }
    else if ((m = rest.match(/^<p>([\s\S]*?)<\/p>/))) {
      push(inline(m[1]))
      rest = rest.slice(m[0].length)
    }
    else {
      // stray text up to next tag
      const idx = rest.indexOf('<')
      if (idx === -1) { push(inline(rest)); break }
      const t = inline(rest.slice(0, idx))
      if (t) push(t)
      rest = rest.slice(idx)
    }
  }

  let joined = out.join('\n\n')
  if (quote) joined = joined.split('\n').map(l => l ? `> ${l}` : '>').join('\n')
  return joined
}

const postsDir = path.join(ROOT, 'site/src/content/posts')
for (const p of posts) {
  const slug = decodeURIComponent(new URL(p.url, 'https://blog.moeyua.com').pathname.replace(/^\/posts\//, '').replace(/\/$/, ''))
  const md = blocks(p.body)
  const fm = [
    '---',
    `title: '${p.title.replace(/'/g, '\'\'')}'`,
    `pubDate: ${p.pubDate}`,
    'categories:',
    `  - ${p.cat}`,
    '---',
    '',
    md,
    '',
  ].join('\n')
  fs.writeFileSync(path.join(postsDir, `${slug}.md`), fm)
  console.log('converted:', slug)
}

// typora post: re-localize images
const tp = path.join(postsDir, '使用-homebrew-安装-typora-的-0-11-18-版本.md')
fs.writeFileSync(tp, fs.readFileSync(tp, 'utf8').replace(/https:\/\/s2\.loli\.net\/2022\/06\/24\//g, '/images/'))
console.log('localized typora images')

// about body is tiny; convert it too
const aboutPath = path.join(ROOT, 'site/src/content/spec/about.md')
const about = fs.readFileSync(aboutPath, 'utf8')
const aboutBody = about.slice(about.indexOf('---', 4) + 3).trim()
const aboutMd = blocks(aboutBody)
fs.writeFileSync(aboutPath, `---\ntitle: ''\npubDate: 2025-02-07\n---\n\n${aboutMd}\n`)
console.log('converted about')
