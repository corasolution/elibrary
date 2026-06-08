const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // Login
    await page.goto('http://localhost:8000/admin/login');
    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    await page.screenshot({ path: 'pw-01-login.png' });
    console.log('Login page loaded');

    await page.fill('input[type="email"]', 'admin@alphaelibrary.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for URL to change away from login
    await page.waitForFunction(() => !window.location.href.includes('/login'), { timeout: 15000 });
    console.log('After login URL:', page.url());
    await page.screenshot({ path: 'pw-02-after-login.png' });

    // Navigate to catalog create
    await page.goto('http://localhost:8000/admin/catalog/create');
    await page.waitForSelector('button', { timeout: 20000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'pw-03-catalog-create.png', fullPage: true });
    console.log('Catalog create page loaded, URL:', page.url());

    const allBtns = await page.$$eval('button', els => els.map(e => e.textContent?.trim().replace(/\s+/g, ' ')).filter(Boolean));
    console.log('Buttons on page:', allBtns);

    const importBtn = await page.$('button:has-text("Import from Library Catalog")');
    console.log('Import button found:', !!importBtn);

    if (importBtn) {
        await importBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'pw-04-import-modal.png', fullPage: true });
        console.log('Modal screenshot taken');

        // Select title search
        const select = await page.waitForSelector('select');
        await page.selectOption('select', 'title');

        // Fill search input (the visible text input in the modal)
        const textInputs = await page.$$('input[type="text"]');
        console.log('Text inputs found:', textInputs.length);
        if (textInputs.length > 0) {
            // The last text input should be the search box in the modal
            const searchInput = textInputs[textInputs.length - 1];
            await searchInput.fill('The Great Gatsby');
            await page.screenshot({ path: 'pw-04b-filled.png', fullPage: true });
            await page.click('button:has-text("Search")');
            console.log('Search clicked, waiting for results...');
            await page.waitForTimeout(10000);
            await page.screenshot({ path: 'pw-05-results.png', fullPage: true });
            console.log('Results screenshot saved');
        }
    }

    await browser.close();
    console.log('All done');
})();
