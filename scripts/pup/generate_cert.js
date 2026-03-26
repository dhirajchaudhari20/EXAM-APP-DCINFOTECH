const puppeteer = require('puppeteer');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });

    // Block all scripts so dashboard.js doesn't redirect us!
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.resourceType() === 'script') {
            request.abort();
        } else {
            request.continue();
        }
    });

    console.log("Loading dashboard...");
    await page.goto('http://localhost:8088/exam-portal/dashboard.html', { waitUntil: 'networkidle0' });

    console.log("Modifying template elements...");
    await page.evaluate(() => {
        const wrap = document.getElementById('certCaptureWrap');
        if (!wrap) {
            console.error("COULD NOT FIND certCaptureWrap! URL: " + window.location.href);
            return;
        }

        document.body.innerHTML = '';
        document.body.appendChild(wrap);
        document.body.style.background = '#ffffff';

        wrap.style.opacity = '1';
        wrap.style.zIndex = '9999';
        wrap.style.position = 'relative';

        const uniqueId = 'devangtyagi_passed_ace_2026';
        document.getElementById('certStudentName').innerText = 'DEVANG TYAGI';
        document.getElementById('certExamName').innerText = 'Associate Cloud Engineer';
        document.getElementById('certCandidateNameDisplay').innerText = 'DEVANG TYAGI';
        document.getElementById('certIssuedDate').innerText = 'March 03, 2026';
        document.getElementById('certUniqueID').innerText = uniqueId;

        // Add exact QR code matching main.js
        const qrData = encodeURIComponent(`https://dcinfotech.org.in/verify?id=${uniqueId}`);
        document.getElementById('certQRCode').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}" style="width: 100%; height: 100%;">`;
    });

    // Wait an extra 4 seconds for fonts + QR code explicitly loading
    await new Promise(resolve => setTimeout(resolve, 4000));

    console.log("Taking screenshot...");
    const element = await page.$('#certificateTemplate');
    if (!element) {
        console.error("COULD NOT FIND #certificateTemplate to screenshot!");
        await browser.close();
        process.exit(1);
    }
    const screenshotBuffer = await element.screenshot({ type: 'png' });

    await browser.close();

    console.log("Uploading to ImgBB...");
    const form = new FormData();
    form.append('image', screenshotBuffer.toString('base64'));

    try {
        const res = await axios.post('https://api.imgbb.com/1/upload?key=3bc6dafa7ecd7c01a118fad187d32ca5', form, {
            headers: form.getHeaders()
        });
        console.log('SUCCESS_URL:', res.data.data.url);
    } catch (e) {
        console.error('FAILED TO UPLOAD:', e.response?.data || e.message);
    }
})();
