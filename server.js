const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/screenshot', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  const userAgent = req.headers['user-agent'];
  const isMobile = /mobile/i.test(userAgent);

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      executablePath: process.env.CHROME_BIN || null // specify path if needed
    });
    const page = await browser.newPage();

    if (isMobile) {
      await page.setViewport({ width: 375, height: 812, isMobile: true });
      await page.setUserAgent(userAgent);
    } else {
      await page.setViewport({ width: 1920, height: 1080 });
    }

    await page.goto(url, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
    await browser.close();
    res.status(200).send(screenshot);
  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.status(500).send('Error taking screenshot');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
