const { scrapHTML } = require("../utils/helper/scrapper");

/**
 * @desc  Handles HTML scraping for a given URL
 * @route POST /api/scrape
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleScrapping = async (req, res) => {
  try {
    const { url: rawUrl } = req.body;
    const url = rawUrl?.trim();

    // Validate presence
    if (!url) {
      return res.status(400).json({ message: "URL is required." });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format." });
    }

    // Perform scraping
    const scrapedContent = await scrapHTML(url);

    return res.status(200).json({
      status: "success",
      message: "HTML scraped successfully.",
      data: scrapedContent,
    });
  } catch (error) {
    console.error("Scraping Error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "An unexpected error occurred while scraping.",
      error: error.message,
    });
  }
};

module.exports = {
  handleScrapping,
};
