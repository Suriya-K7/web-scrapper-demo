const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");

/**
 * @desc Extracts structured headings and content from HTML
 * @param {string} htmlContent - Raw HTML content
 * @returns {{structure: string, content: string}}
 */
const extractStructuredData = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  const contentRoot = $("main").length ? $("main") : $("body");

  const headingTag = "h2";
  const subheadingTag = "h3";

  const structuredData = [];
  const contentDataStructured = [];
  let currentH2 = null;
  let h3Count = 0;

  contentRoot.find(`${headingTag}, ${subheadingTag}`).each((_, element) => {
    const $el = $(element);

    if ($el.is(headingTag)) {
      const h2Text = $el.text().trim();
      const h2WordCount = h2Text.split(/\s+/).length;
      h3Count = 0;

      if (h2WordCount) {
        const nextElements = $el.nextUntil(headingTag);
        const contentArray = nextElements
          .map((_, el) => ({
            tag: $(el)[0].tagName,
            text: $(el).text().trim(),
          }))
          .get();

        const contentText = contentArray.map((e) => e.text).join(" ");
        const totalWordCount = h2WordCount + contentText.split(/\s+/).length;

        if (totalWordCount >= 50) {
          if (currentH2) structuredData.push(currentH2);

          currentH2 = {
            heading: h2Text,
            count: structuredData.length + 1,
            subheadings: [],
            contentElements: contentArray,
          };

          contentDataStructured.push({
            heading: h2Text,
            contentElements: contentArray,
          });
        }
      }
    } else if ($el.is(subheadingTag) && currentH2) {
      const subheadingText = $el.text().trim();
      const nextElements = $el.nextUntil(`${headingTag}, ${subheadingTag}`);
      const contentArray = nextElements
        .map((_, el) => ({
          tag: $(el)[0].tagName,
          text: $(el).text().trim(),
        }))
        .get();

      const contentText = contentArray.map((e) => e.text).join(" ");
      const totalWordCount =
        subheadingText.split(/\s+/).length + contentText.split(/\s+/).length;

      if (totalWordCount >= 50) {
        h3Count++;
        currentH2.subheadings.push({
          heading: subheadingText,
          prefix: String.fromCharCode(64 + h3Count),
          contentElements: contentArray,
        });
      }
    }
  });

  if (currentH2) structuredData.push(currentH2);

  const structure = structuredData
    .map((item) => {
      const subs = item.subheadings
        .map((sub) => `${sub.prefix}. ${sub.heading}`)
        .join("\n");
      return `${item.count}. ${item.heading}\n${subs}`;
    })
    .join("\n\n");

  const content = contentDataStructured
    .map((item, index) => {
      const detail = item.contentElements
        .map((el, i) => `${i + 1}. [${el.tag}] ${el.text}`)
        .join("\n");
      return `heading_content_Google${index + 1}. ${item.heading}\n${detail}\n`;
    })
    .join("\n");

  return { structure, content };
};

/**
 * @desc Scrapes a given URL and returns structured data, favicon, and metadata
 * @param {string} url - Website URL to scrape
 * @returns {Promise<Object>}
 */
const scrapHTML = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1280x1696",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 3000, height: 10000 });

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const blocked = ["stylesheet", "image", "font", "media", "xhr", "other"];
      blocked.includes(req.resourceType()) ? req.abort() : req.continue();
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const htmlContent = await page.evaluate(() => {
      const el = document.querySelector("body");
      return el ? el.innerHTML : null;
    });

    if (!htmlContent) throw new Error("No content found in body");

    const faviconUrl = await page.evaluate(() => {
      const icon = document.querySelector(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
      );
      return icon?.href || null;
    });

    await browser.close();

    const $ = cheerio.load(htmlContent);
    $("script, iframe, .ad, .advertisement, .promo").remove();

    const getWordCount = (html) =>
      cheerio.load(html).text().trim().split(/\s+/).length;

    const parentSelectors = ["div", "section", "article", "main"];
    const allSignificantSections = [];

    for (const selector of parentSelectors) {
      $(selector).each((_, el) => {
        const html = $(el).html();
        if (getWordCount(html) >= 30) {
          allSignificantSections.push(html);
        }
      });
    }

    if (!allSignificantSections.length) {
      throw new Error("No significant content blocks found.");
    }

    const combinedHtml = `<body>${allSignificantSections.join("\n")}</body>`;
    const structuredData = extractStructuredData(combinedHtml);
    const scrapedMeta = await scrapeWebsite(url, htmlContent);

    return {
      scrapedMeta,
      structuredData,
      faviconUrl,
      htmlContent,
    };
  } catch (error) {
    await browser.close();
    throw new Error(error.message);
  }
};

/**
 * @desc Extracts company name, email, and phone numbers from page
 * @param {string} url - Target URL
 * @param {string} htmlContent - Raw HTML from page
 * @returns {Promise<Object>}
 */
const scrapeWebsite = async (url, htmlContent) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(htmlContent);

    const companyName = $("title").text().trim() || "N/A";

    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/g;
    const phoneRegex = /\+?\d[\d\s\-]{7,}/g;

    const emails = [...new Set(data.match(emailRegex) || [])];
    const phones = [...new Set(data.match(phoneRegex) || [])];

    return {
      url,
      companyName,
      contact: {
        emails,
        phones,
      },
    };
  } catch (err) {
    return { url, error: err.message };
  }
};

module.exports = {
  scrapHTML,
  scrapeWebsite,
};
