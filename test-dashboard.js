const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    // Simulate login and go to dashboard
    await page.goto('https://dcinfotech.org.in/exam-portal/index.html', { waitUntil: 'load' });
    
    // We can just evaluate setting the localStorage directly and then navigating!
    await page.evaluate(() => {
        localStorage.setItem("cm_user", JSON.stringify({ email: "test@example.com", name: "Test User" }));
        window.location.href = "exam-portal/dashboard.html";
    });
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log("Navigated to:", page.url());
    
    // Wait an extra bit for dynamic scripts
    await new Promise(r => setTimeout(r, 3000));
    
    await browser.close();
})();
