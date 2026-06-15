const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
      console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
  });
  
  page.on('requestfailed', request => {
      console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  console.log("Navigating to http://localhost:4173/os ...");
  await page.goto('http://localhost:4173/os', { waitUntil: 'networkidle0' });
  
  console.log("Waiting a couple seconds to see if it crashes...");
  await new Promise(r => setTimeout(r, 2000));
  
  // Dump the root HTML to see if it's empty
  const rootHtml = await page.evaluate(() => {
    return document.getElementById('root') ? document.getElementById('root').innerHTML.substring(0, 500) : 'No root div';
  });
  console.log("ROOT HTML DUMP:");
  console.log(rootHtml);
  
  await browser.close();
})();
