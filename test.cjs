const puppeteer = require('puppeteer');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    page.on('console', msg => {
        console.log(`[${msg.type()}] ${msg.text()}`);
    });

    console.log('Navigating to http://localhost:5173/intro...');
    await page.goto('http://localhost:5173/intro', { waitUntil: 'networkidle0' });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'screenshot.png' });
    
    console.log('Closing browser...');
    await browser.close();
})();
