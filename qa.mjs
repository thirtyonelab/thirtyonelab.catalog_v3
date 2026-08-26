import { chromium } from 'playwright';
import { exec } from 'child_process';

const URL = 'http://localhost:4173/thirtyonelab.catalog_v3/';

async function runTest() {
  console.log('Starting preview server...');
  const server = exec('npx vite preview --port 4173');
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let hasErrors = false;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`PAGE ERROR: ${msg.text()} | URL: ${msg.location().url}`);
      hasErrors = true;
    }
  });
  page.on('pageerror', error => {
    console.error(`PAGE EXCEPTION: ${error.message} | Stack: ${error.stack}`);
    hasErrors = true;
  });

  try {
    console.log('Navigating to', URL);
    await page.goto(URL, { waitUntil: 'networkidle' });
    
    // Click some things as required: product popups, lightbox, quote builder, language toggle
    console.log('Testing interactions...');
    
    // Wait for at least one card to be visible
    const hubBtn = await page.$('#v3BtnCollection');
    if (hubBtn) {
      console.log('Clicking Collection button in Hub...');
      await hubBtn.click();
    }

    await page.waitForSelector('.v3-product-card', { timeout: 5000 });
    const cards = await page.$$('.v3-product-card');
    if (cards.length > 0) {
      console.log('Clicking first product card to open popup...');
      await cards[0].click();
      await page.waitForSelector('#lightboxOverlay.active', { timeout: 3000 });
      console.log('Lightbox opened successfully.');
      
      // Close lightbox
      const closeBtn = await page.$('#lightboxOverlay.active');
      if (closeBtn) {
        // In V3, clicking the overlay itself closes the lightbox
        await page.mouse.click(10, 10);
        await page.waitForTimeout(500); // Wait for transition
        console.log('Lightbox closed.');
      }
    }

    // Try opening Quote Builder
    const qbBtn = await page.$('.floating-fab');
    if (qbBtn) {
      console.log('Opening quote builder...');
      await qbBtn.click();
      await page.waitForSelector('#quoteBuilderModal.show', { timeout: 3000 });
      console.log('Quote builder opened.');
    }
    
    // Test language toggle
    const langToggle = await page.$('#langToggle');
    if (langToggle) {
      console.log('Toggling language...');
      await langToggle.click();
      await page.waitForTimeout(500);
      console.log('Language toggled.');
    }

    if (hasErrors) {
      console.error('QA Test FAILED: Console errors detected.');
      process.exit(1);
    } else {
      console.log('QA Test PASSED.');
    }

  } catch (error) {
    console.error('QA Test FAILED with exception:', error);
    process.exit(1);
  } finally {
    await browser.close();
    server.kill();
    process.exit(hasErrors ? 1 : 0);
  }
}

runTest();
