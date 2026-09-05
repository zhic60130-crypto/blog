// 原站行为实测：1) 单次点击进出场序列  2) 快速连点两个按钮的中断处理
const { chromium } = require('C:/Users/LENOVO/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright')

const TARGET = process.argv[2] || 'https://blog.moeyua.com'

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errs = []
  page.on('pageerror', e => errs.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })

  await page.goto(TARGET + '/categories/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // --- 1) 单次点击：采样 header/main/footer 的 opacity，看谁在动 ---
  console.log('== single click: who animates? ==')
  await page.evaluate(() => {
    window.__s = []
    window.__t = setInterval(() => {
      const g = sel => { const el = document.querySelector(sel); return el ? getComputedStyle(el).opacity : 'x' }
      window.__s.push([performance.now() | 0, document.documentElement.className.replace(/swup-enabled ?/g, '') || '-', 'H:' + g('.transition-swup-header'), 'M:' + g('.transition-swup-main'), 'F:' + g('.transition-swup-footer')])
    }, 120)
  })
  await page.click('header nav a[href="/about"]')
  await page.waitForTimeout(1800)
  await page.evaluate(() => clearInterval(window.__t))
  for (const r of await page.evaluate(() => window.__s)) console.log(r.join(' | '))

  // --- 2) 快速连点两个按钮（leave 阶段中途点第二个） ---
  console.log('== rapid double click ==')
  await page.waitForTimeout(800)
  await page.evaluate(() => {
    window.__log = []
    new MutationObserver(() => window.__log.push([performance.now() | 0, document.documentElement.className]))
      .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })
  await page.click('header nav a[href="/archive"]')
  await page.waitForTimeout(200) // leave 中途
  await page.click('header nav a[href="/"]')
  await page.waitForTimeout(3000)
  for (const r of await page.evaluate(() => window.__log)) console.log(r.join(' | '))
  console.log('final url:', page.url())
  console.log('stuck classes:', await page.evaluate(() => document.documentElement.className))
  console.log('main rendered:', await page.evaluate(() => document.querySelector('main').innerText.slice(0, 40).replace(/\n/g, ' ')))
  console.log('errors:', errs.length ? errs : 'none')
  await browser.close()
})().catch(e => { console.error('FATAL', e); process.exit(1) })
