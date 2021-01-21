import puppeteer from 'puppeteer';

export const scrapeDetailPage = async (url) => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"]});
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
  );
  await page.goto(url);

  try {
    await page.waitForSelector('.financials');
  } catch {
    throw new Error('Error Accessing Page');
  }

  let listing = {
    url,
    status: 'active',
    title: undefined,
    askingPrice: undefined,
    cashFlow: undefined,
    revenue: undefined,
    ffe: undefined,
    inventory: undefined,
    yearEstablished: undefined,
    ebitda: undefined,
    location: undefined,
    employees: undefined,
    reasonForSelling: undefined,
  };

  // Cash Flow + Asking Price
  const title = await page.$eval('.bfsTitle', (el) => {
    return el.textContent.trim();
  });

  // Cash Flow + Asking Price
  const cashflowAskingPrice = await page.$$eval('.price > b', (els) => {
    const parseMoneyValue = (el) => {
      const value = Number(el.textContent.trim().slice(1).replace(/,/g, ''));
      if (value === NaN) {
        return undefined;
      } else return value;
    };

    const listing = {};
    listing.askingPrice = parseMoneyValue(els[0]);
    listing.cashFlow = parseMoneyValue(els[1]);
    return listing;
  });
  // Secondary Stats
  const otherStats = await page.$$eval('.specs > p > b', (els) => {
    const parseMoneyValue = (el) => {
      const value = Number(el.textContent.trim().slice(1).replace(/,/g, ''));
      if (value === NaN) {
        return undefined;
      } else return value;
    };

    const parseYear = (el) => {
      const value = Number(el.textContent.trim());
      if (value === NaN) {
        return undefined;
      } else return value;
    };

    const listing = {};
    const targetEls = els.slice(2);
    listing.revenue = parseMoneyValue(targetEls[0]);
    listing.ebitda = parseMoneyValue(targetEls[1]);
    listing.ffe = parseMoneyValue(targetEls[2]);
    listing.inventory = parseMoneyValue(targetEls[3]);
    // listing.yearEstablished = parseYear(targetEls[5]);
    return listing;
  });
  // Employees, Location, Reason For Selling
  const extraData = await page.$eval('dl', (el) => {
    const listing = {};

    const children = Array.from(el.querySelectorAll('*'));
    const childLabels = children.map((child) => {
      return child.querySelector('strong').textContent;
    });

    childLabels.forEach((label, index) => {
      if (label === 'Location:') {
        listing.location = children[index + 2].textContent;
      }
      if (label === 'Employees:') {
        listing.employees = children[index + 2].textContent;
      }
      if (label === 'Reason for Selling:') {
        listing.reasonForSelling = children[index + 2].textContent;
      }
    });
    return listing;
  });
  listing = { title, ...cashflowAskingPrice, ...otherStats, ...extraData };
  browser.close();
  return listing;
};
