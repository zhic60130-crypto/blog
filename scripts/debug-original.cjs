// Compare html class mutations + main opacity on nav click: ORIGINAL site
const { chromium } = require('C:/Users/LENOVO/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('https://blog.moeyua.com/about/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  await page.evaluate(() => {
    window.__log = []
    const obs = new MutationObserver(() => {
      const main = document.querySelector('.transition-swup-main')
      const cs = main ? getComputedStyle(main).opacity : 'nomain'
      window.__log.push([performance.now() | 0, document.documentElement.className, cs])
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })

  await page.click('header nav a[href="/archive"]')
  await page.waitForTimeout(3000)
  for (const s of await page.evaluate(() => window.__log)) console.log(s.join(' | '))
  console.log('final url:', page.url())
  await browser.close()
})().catch(e => { console.error('FATAL', e); process.exit(1) })
