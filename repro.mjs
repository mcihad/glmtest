import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] })
const p = await b.newPage()
const errs = []
p.on('console', m => { if (m.type()==='error') errs.push(m.text()) })
p.on('pageerror', e => errs.push('PAGE: '+e.message))
await p.goto('http://127.0.0.1:5184/components', { waitUntil: 'networkidle2', timeout: 20000 })
await new Promise(r => setTimeout(r, 1500))
const probe = await p.evaluate(async () => {
  const r = await import('/node_modules/react/index.js?t='+Date.now()).catch(e => 'ERR: '+e.message)
  return { typeofReact: typeof r, keys: r ? Object.keys(r).slice(0,12) : null, hasUseRef: !!(r && r.useRef), hasDefault: !!(r && r.default) }
})
console.log('PROBE:', JSON.stringify(probe))
console.log('ERRORS ('+errs.length+'):', JSON.stringify(errs.slice(0,5), null, 2))
await b.close()
