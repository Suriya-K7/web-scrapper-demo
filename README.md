### ✅ `README.md`

```md
# 🕸️ Web Scraper API

This is a simple yet powerful **Node.js web scraper API** built with **Puppeteer**, **Cheerio**, and **Express.js**. It extracts structured content, metadata, and contact info (emails and phone numbers) from a given URL and returns it in a clean, structured JSON format.

---

## 🚀 Features

- 🔍 Extracts heading structure (`<h2>`, `<h3>`) and content blocks
- 🧠 Filters meaningful content with word count threshold
- 📧 Detects emails and phone numbers
- 🧭 Extracts favicon and title as metadata
- ⚙️ Easy-to-use API with JSON response
- 🚫 Skips unnecessary assets (images, stylesheets, fonts) for faster scraping

---

## 🧑‍💻 Tech Stack

- **Node.js**
- **Express.js**
- **Puppeteer** – for headless browser scraping
- **Cheerio** – for HTML parsing
- **Axios** – for metadata fetching
- **dotenv** – for environment configuration

---
```

## 📁 Project Structure

```
project-root/
│
├── index.js # Entry point (Express app)
├── .env # Environment variables
├── utils/
│ ├── config.js # Centralized configuration
│ └── helper/
│ └── scrapper.js # Puppeteer + Cheerio scraping logic
│
├── controllers/
│ └── scrapperController.js # Handles scrape route logic
│
├── routes/
│ └── scrapperRoutes.js # API route: POST /api/scrapper
│
└── public/ # Static files (if needed)

```

---

## ⚙️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/Suriya-K7/web-scrapper-demo.git
cd web-scraper-api cd BE
```

2. **Install dependencies**

```bash
npm install
```

3. **Create a `.env` file**

```env
PORT=5000
```

---

## 🧪 Usage

### Start the server

```bash
node index.js
```

The server will start on `http://localhost:5000`.

### ✅ API Endpoint

**POST** `/api/scrapper`

#### Request Body:

```json
{
  "url": "https://example.com"
}
```

#### Response:

```json
{
  "status": "success",
  "message": "HTML scraped successfully.",
  "data": {
    "scrapedMeta": {
      "url": "https://example.com",
      "companyName": "Example - Site Title",
      "contact": {
        "emails": ["info@example.com"],
        "phones": ["+123456789"]
      }
    },
    "structuredData": {
      "structure": "1. Main Heading\nA. Subheading...",
      "content": "heading_content_Google1. Main Heading\n1. [p] Paragraph content..."
    },
    "faviconUrl": "https://example.com/favicon.ico",
    "htmlContent": "<body>...</body>"
  }
}
```

---

## 📦 Dependencies

```json
"dependencies": {
  "axios": "^1.6.7",
  "cheerio": "^1.0.0-rc.12",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "express": "^4.18.2",
  "puppeteer": "^21.3.8"
}
```
