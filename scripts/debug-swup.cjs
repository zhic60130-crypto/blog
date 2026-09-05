// Debug: click a nav link on the clone and observe swup behavior
const { chromium } = require('C:/Users/LENOVO/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const logs = []
  page.on('console', m => logs.push(`[console.${m.type()}] ${m.text()}`))
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))
  page.on('framenavigated', f => { if (f === page.mainFrame()) logs.push(`[framenavigated] ${f.url()}`) })

  await page.goto('http://127.0.0.1:4321/about/', { waitUntil: 'networkidle' })
  logs.push('[state] window.swup = ' + await page.evaluate(() => typeof window.swup))

  // watch html class mutations during click
  await page.evaluate(() => {
    window.__classLog = []
    const obs = new MutationObserver(() => window.__classLog.push(document.documentElement.className))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })

  await page.click('header nav a[href="/archive"]')
  await page.waitForTimeout(2500)

  console.log('class mutations:', await page.evaluate(() => window.__classLog))
  console.log('final url:', page.url())
  console.log('h2 text:', await page.evaluate(() => document.querySelector('main h2, main h1')?.textContent?.trim()))
  console.log(logs.join('\n'))
  await browser.close()
})().catch(e => { console.error('FATAL', e); process.exit(1) })
