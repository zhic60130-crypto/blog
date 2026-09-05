// 帧率/长任务测量：首载动画 + 每次点击过渡期间的掉帧情况
const { chromium } = require('C:/Users/LENOVO/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright')

async function sampleWindow(page, ms = 1600) {
  return page.evaluate(ms => new Promise(resolve => {
    const deltas = []
    const longtasks = []
    let last = performance.now()
    const po = new PerformanceObserver(l => l.getEntries().forEach(e => longtasks.push(Math.round(e.duration))))
    po.observe({ entryTypes: ['longtask'] })
    const t0 = performance.now()
    function tick(t) {
      deltas.push(t - last)
      last = t
      if (t - t0 < ms) requestAnimationFrame(tick)
      else {
        po.disconnect()
        const bad = deltas.filter(d => d > 34)          // <~30fps 的帧间隔
        const worst = Math.max(...deltas)
        resolve({ frames: deltas.length, badFrames: bad.length, worstGap: Math.round(worst), longtasks })
      }
    }
    requestAnimationFrame(tick)
  }), ms)
}

;(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://127.0.0.1:4321/about/', { waitUntil: 'domcontentloaded' })
  console.log('initial-load :', JSON.stringify(await sampleWindow(page)))
  await page.waitForTimeout(1500)
  for (const href of ['/archive', '/categories', '/']) {
    await page.click(`header nav a[href="${href}"]`)
    console.log(`click ${href.padEnd(12)}:`, JSON.stringify(await sampleWindow(page)))
    await page.waitForTimeout(1200)
  }
  await browser.close()
})().catch(e => { console.error('FATAL', e); process.exit(1) })
