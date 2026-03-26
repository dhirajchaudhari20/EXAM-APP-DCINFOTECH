require('dotenv').config();
const puppeteer = require('puppeteer-stream');
const fs = require('fs');
const { launch } = require('puppeteer');

// Configuration
const MEET_URL = process.argv[2] || process.env.MEET_URL;
if (!MEET_URL) {
    console.error("Please provide a Google Meet URL as an argument or in .env");
    process.exit(1);
}

const HEADLESS = process.env.HEADLESS !== 'false'; // Default to true

(async () => {
    console.log(`[Bot] Launching Chrome (Headless: ${HEADLESS})...`);

    // Mac-specific executable path (optional fix for crashes)
    const possiblePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
    ];
    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

    // If running locally (not in Docker), try to find system Chrome if bundled fails
    if (!executablePath && process.platform === 'darwin' && !process.env.USE_BUNDLED_CHROMIUM) {
        executablePath = possiblePaths.find(p => fs.existsSync(p));
        if (executablePath) console.log(`[Bot] Using system Chrome at: ${executablePath}`);
    }

    const browser = await launch({
        headless: HEADLESS ? "new" : false,
        executablePath: executablePath, // Use system chrome if found
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--disable-blink-features=AutomationControlled'
        ],
        defaultViewport: { width: 1280, height: 720 },
        ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();

    // Grant permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://meet.google.com', ['microphone', 'camera', 'notifications']);

    console.log(`[Bot] Navigating to ${MEET_URL}...`);
    await page.goto(MEET_URL, { waitUntil: 'networkidle2' });

    // --- Join Flow ---
    try {
        console.log("[Bot] Entering waiting room...");

        // Input Name (if prompted - Guest Mode)
        try {
            const nameInput = await page.waitForSelector('input[type="text"]', { timeout: 5000 });
            if (nameInput) {
                console.log("[Bot] Entering name...");
                await nameInput.type("AI Agent");
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (e) {
            console.log("[Bot] Already logged in or no name prompt.");
        }

        // Disable Mic/Cam before joining (Optional, but good practice to start muted)
        // Note: We might want mic ON if we want to speak immediately, but usually better to start OFF.
        // For this agent, we KEEP IT ON to pipe audio.

        // "Ask to join" or "Join now" button
        console.log("[Bot] Looking for Join button...");
        try {
            await page.waitForFunction(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.some(b => b.innerText.includes('Ask to join') || b.innerText.includes('Join now'));
            }, { timeout: 10000 });

            const clicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.innerText.includes('Ask to join') || b.innerText.includes('Join now'));
                if (btn) {
                    btn.click();
                    return true;
                }
                return false;
            });

            if (clicked) {
                console.log("[Bot] Clicked Join button!");
            } else {
                console.error("[Bot] Join button found but click failed inside evaluate.");
            }
        } catch (e) {
            console.error("[Bot] Join button not found (timeout).");
            await page.screenshot({ path: 'debug-join-fail.png' });
        }

        console.log("[Bot] Waiting to be admitted...");
        // Wait for a selector that indicates we are IN the meeting
        // e.g., the specific "meeting details" button or end call button
        await page.waitForSelector('button[aria-label="Leave call"]', { timeout: 60000 });
        console.log("[Bot] Successfully joined the meeting!");

        // --- Audio Pipeline ---
        // In a real scenario, we would pipe the stream:
        // const stream = await puppeteer.getStream(page, { audio: true, video: false });
        // require('./audio-manager').handleStream(stream);

        // Initialize Brain (Simulated)
        const brain = require('./brain');
        await brain.introduce(); // Say hello

        console.log("[Bot] Listening for interns...");

        // Keep the process alive
        await new Promise(r => setTimeout(r, 600000)); // Run for 10 mins then exit (for test)

    } catch (error) {
        console.error("[Bot] Error during execution:", error);
        await page.screenshot({ path: 'debug-error.png' });
    } finally {
        console.log("[Bot] Closing browser...");
        await browser.close();
    }

})();
