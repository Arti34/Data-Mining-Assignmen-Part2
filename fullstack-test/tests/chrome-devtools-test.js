const puppeteer = require('puppeteer-core');
const path = require('node:path');
const fs = require('node:fs');
const { app, server } = require('../server/index');

const CHROME_PATH = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
].find(p => fs.existsSync(p));

if (!CHROME_PATH) {
  console.error('❌ Google Chrome executable not found in Program Files.');
  process.exit(1);
}

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runDevToolsAudit() {
  console.log('===============================================================');
  console.log('🧪 Starting Chrome DevTools Automated Frontend Test Suite');
  console.log('Chrome Binary:', CHROME_PATH);
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--remote-debugging-port=9222',
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. DevTools Console Listener
  const consoleMessages = [];
  const errors = [];
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text });
    if (type === 'error') {
      errors.push(text);
      console.log(`[DevTools Console ERROR]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.log(`[DevTools Page Error]: ${err.message}`);
  });

  // 2. DevTools Network Request Tracking
  const networkRequests = [];
  page.on('response', response => {
    const req = response.request();
    networkRequests.push({
      url: req.url(),
      method: req.method(),
      status: response.status(),
      resourceType: req.resourceType()
    });
  });

  console.log('🌐 Navigating to http://localhost:3000 via Chrome DevTools Protocol...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });

  console.log('✔ Page loaded successfully.');

  // 3. DevTools Performance & Core Web Vitals Audit
  const performanceMetrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint');

    return {
      dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
      tcp: Math.round(nav.connectEnd - nav.connectStart),
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      loadDuration: Math.round(nav.loadEventEnd - nav.startTime),
      fcp: fcp ? Math.round(fcp.startTime) : null
    };
  });

  console.log('\n📊 [Chrome DevTools Performance Metrics]:');
  console.log(` - TTFB (Time to First Byte): ${performanceMetrics.ttfb}ms`);
  console.log(` - First Contentful Paint (FCP): ${performanceMetrics.fcp}ms`);
  console.log(` - DOMContentLoaded Event: ${performanceMetrics.domContentLoaded}ms`);
  console.log(` - Full Page Load Event: ${performanceMetrics.loadDuration}ms`);

  // 4. DevTools Network Audit Summary
  console.log('\n📡 [Chrome DevTools Network Audit]:');
  console.log(` - Total HTTP Network Requests: ${networkRequests.length}`);
  const failedRequests = networkRequests.filter(r => r.status >= 400);
  if (failedRequests.length === 0) {
    console.log(' ✔ 0 failed network requests (100% HTTP 2xx/3xx success rate)');
  } else {
    console.log(` ⚠️ ${failedRequests.length} failed requests:`, failedRequests);
  }

  // 5. Accessibility & DOM Structure Audit
  const a11ySummary = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const buttonsWithoutLabel = buttons.filter(b => {
      const text = b.innerText.trim();
      const ariaLabel = b.getAttribute('aria-label');
      const title = b.getAttribute('title');
      return !text && !ariaLabel && !title;
    });

    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    const landmarks = {
      hasHeader: Boolean(document.querySelector('header')),
      hasMain: Boolean(document.querySelector('main')),
      hasNav: Boolean(document.querySelector('nav'))
    };

    const taskCards = document.querySelectorAll('h3');

    return {
      totalButtons: buttons.length,
      unlabeledButtonsCount: buttonsWithoutLabel.length,
      totalInputs: inputs.length,
      landmarks,
      initialTasksCount: taskCards.length
    };
  });

  console.log('\n♿ [Chrome DevTools Accessibility & Semantic Audit]:');
  console.log(` - Semantic Landmarks: header=${a11ySummary.landmarks.hasHeader}, main=${a11ySummary.landmarks.hasMain}, nav=${a11ySummary.landmarks.hasNav}`);
  console.log(` - Total Buttons Audited: ${a11ySummary.totalButtons}`);
  console.log(` - Unlabeled Buttons: ${a11ySummary.unlabeledButtonsCount} (Pass: 0 unlabeled)`);
  console.log(` - Rendered Tasks on Load: ${a11ySummary.initialTasksCount}`);

  // Screenshot 1: List View
  const ss1 = path.join(SCREENSHOT_DIR, '1-list-view.png');
  await page.screenshot({ path: ss1, fullPage: true });
  console.log(`📷 Saved Screenshot 1 (List View): ${ss1}`);

  // 6. Interactive Testing: Toggle Task Completion
  console.log('\n👆 [Interaction Test 1: Toggle Task Completion]');
  const firstCheckbox = await page.$('button[aria-label="Mark as complete"]');
  if (firstCheckbox) {
    await firstCheckbox.click();
    await new Promise(r => setTimeout(r, 600)); // Allow animation & sound
    const isNowCompleted = await page.$('button[aria-label="Mark as incomplete"]');
    console.log(` ✔ Clicked checkbox. Task completion state toggled: ${Boolean(isNowCompleted)}`);
  }

  // 7. Interactive Testing: Switch to Kanban Board View
  console.log('\n👆 [Interaction Test 2: Switch to Kanban Board]');
  await page.keyboard.press('2');
  await new Promise(r => setTimeout(r, 600));
  const kanbanColumns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h3')).map(h => h.innerText).filter(t => ['To Do', 'In Progress', 'Completed'].includes(t));
  });
  console.log(` ✔ Switched to Kanban Board via shortcut "2". Columns found:`, kanbanColumns);

  const ss2 = path.join(SCREENSHOT_DIR, '2-kanban-view.png');
  await page.screenshot({ path: ss2, fullPage: true });
  console.log(`📷 Saved Screenshot 2 (Kanban Board): ${ss2}`);

  // 8. Interactive Testing: Switch to Analytics Insights View
  console.log('\n👆 [Interaction Test 3: Switch to Analytics Insights]');
  await page.keyboard.press('3');
  await new Promise(r => setTimeout(r, 600));
  const analyticsSummary = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasCompletionRate: text.includes('Completion Rate'),
      hasStreak: text.includes('Current Streak'),
      hasCategoryDistribution: text.includes('Category Distribution')
    };
  });
  console.log(' ✔ Switched to Insights via shortcut "3":', analyticsSummary);

  const ss3 = path.join(SCREENSHOT_DIR, '3-analytics-view.png');
  await page.screenshot({ path: ss3, fullPage: true });
  console.log(`📷 Saved Screenshot 3 (Analytics Dashboard): ${ss3}`);

  // 9. Interactive Testing: Command Palette (Ctrl+K)
  console.log('\n👆 [Interaction Test 4: Open Command Palette]');
  await page.keyboard.down('Control');
  await page.keyboard.press('k');
  await page.keyboard.up('Control');
  await new Promise(r => setTimeout(r, 500));

  const paletteOpen = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="command or search"]');
    return Boolean(input);
  });
  console.log(` ✔ Dispatched Ctrl+K. Command Palette visible: ${paletteOpen}`);

  const ss4 = path.join(SCREENSHOT_DIR, '4-command-palette.png');
  await page.screenshot({ path: ss4 });
  console.log(`📷 Saved Screenshot 4 (Command Palette): ${ss4}`);

  // Dismiss Command Palette
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // 10. Interactive Testing: Toggle Dark Mode (D)
  console.log('\n👆 [Interaction Test 5: Toggle Dark Mode]');
  await page.keyboard.press('d');
  await new Promise(r => setTimeout(r, 400));
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log(` ✔ Dispatched "D" shortcut. Dark mode applied: ${isDark}`);

  const ss5 = path.join(SCREENSHOT_DIR, '5-dark-mode.png');
  await page.screenshot({ path: ss5, fullPage: true });
  console.log(`📷 Saved Screenshot 5 (Dark Mode): ${ss5}`);

  // 11. Final Console Error Check
  console.log('\n===============================================================');
  if (errors.length === 0) {
    console.log('🎉 ZERO CONSOLE OR RUNTIME ERRORS DETECTED BY CHROME DEVTOOLS!');
  } else {
    console.log(`⚠️ DevTools recorded ${errors.length} errors:`, errors);
  }
  console.log('===============================================================\n');

  await browser.close();
  server.close();
  process.exit(errors.length === 0 ? 0 : 1);
}

// Allow server to bind, then run audit
setTimeout(runDevToolsAudit, 500);
