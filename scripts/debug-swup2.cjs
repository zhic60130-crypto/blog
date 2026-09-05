// Sample .transition-swup-main computed opacity across a swup navigation
const { chromium } = require('C:/Users/LENOVO/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://127.0.0.1:4321/about/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500) // let entrance animation finish

  await page.evaluate(() => {
    window.__samples = []
    const main = document.querySelector('.transition-swup-main')
    window.__timer = setInterval(() => {
      const cs = getComputedStyle(main)
      window.__samples.push([Date.now() % 100000, cs.opacity, cs.transform, document.documentElement.className])
    }, 100)
  })

  await page.click('header nav a[href="/archive"]')
  await page.waitForTimeout(2500)
  const samples = await page.evaluate(() => window.__samples)
  for (const s of samples) console.log(s.join(' | '))
  await browser.close()
})().catch(e => { console.error('FATAL', e); process.exit(1) })
