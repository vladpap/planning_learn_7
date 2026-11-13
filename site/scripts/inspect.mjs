/**
 * Screenshot and layout probe for the built site.
 *
 * Usage: node scripts/inspect.mjs <url> <width> <height> <output.png>
 * Prints document scroll width and the widest offending elements, so layout
 * overflow on mobile is visible instead of guessed.
 */

import puppeteer from 'puppeteer-core';

const [url, width = '1440', height = '1200', output = 'shot.png'] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars'],
});

const page = await browser.newPage();
await page.setViewport({width: Number(width), height: Number(height), deviceScaleFactor: 1});
await page.goto(url, {waitUntil: 'networkidle0'});
await new Promise(resolve => setTimeout(resolve, 800));

const metrics = await page.evaluate(() => {
  const viewportWidth = document.documentElement.clientWidth;
  const offenders = Array.from(document.querySelectorAll('*'))
    .map(element => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === 'string' ? element.className.slice(0, 60) : '',
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      };
    })
    .filter(item => item.right > viewportWidth + 1)
    .sort((a, b) => b.right - a.right)
    .slice(0, 8);

  return {
    viewportWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders,
  };
});

console.log(JSON.stringify(metrics, null, 2));
await page.screenshot({path: output, fullPage: false});
await browser.close();
