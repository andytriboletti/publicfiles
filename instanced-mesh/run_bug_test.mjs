import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('Launching browser (NOT headless). Please observe the browser console.');
  const browser = await puppeteer.launch({ 
    headless: false, // Set to false to see the browser window
    devtools: true, // Automatically open devtools
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security' // May be needed for file:// URLs and certain CDN requests
    ]
  });
  const page = await browser.newPage();

  // Relay browser console messages to Node console (still useful as a backup)
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'log' || type === 'warn' || type === 'error' || type === 'info') {
      console.log(`[NODE RELAY - BROWSER ${type.toUpperCase()}]: ${text}`);
    }
  });

  const filePath = path.join(__dirname, 'instancedMesh2_test.html');
  const fileUrl = `file://${filePath}`;

  console.log(`Navigating to ${fileUrl} ...`);

  try {
    await page.goto(fileUrl, { waitUntil: 'networkidle0' }); // Wait until network is idle
    console.log('Page loaded. Test logs should appear in the browser console.');
    
    console.log('Waiting for 30 seconds for observation. Please copy logs from browser console.');
    await new Promise(resolve => setTimeout(resolve, 30000)); // Increased wait time

  } catch (error) {
    console.error('Error during page navigation or execution:', error);
  } finally {
    console.log('Closing browser.');
    await browser.close();
  }
}

runTest().catch(console.error); 