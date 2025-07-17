// router config

const scrapperRouter = require("express").Router();

const { handleScrapping } = require("../controllers/scrapperController");

scrapperRouter.post("/api/scrapper", handleScrapping);

module.exports = scrapperRouter;
