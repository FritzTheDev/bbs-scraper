import puppeteer from 'puppeteer';

export const scrapeListPage = async (targetPage) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
  );
  await page.goto(targetPage);

  try {
    await page.waitForSelector('.saveFavorite');
  } catch {
    throw new Error('Error Accessing Page');
  }

  const urls = await page.$$eval('.saveFavorite', (els) => {
    const paths = els.map((el) => el.parentElement.parentElement.getAttribute('href'));
    const urls = paths.map((path) => `https://bizbuysell.com${path}`);
    return urls;
  });

  browser.close();
  return urls;
};
