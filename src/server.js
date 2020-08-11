const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();

const port = 3000;

app.set('view engine', 'njk');

nunjucks.configure(path.resolve(__dirname, 'views'), {
  autoescape: true,
  express: app,
  watch: true,
});

app.use('/files', express.static(path.resolve(__dirname, 'static')));

app.get('/', function(req, res) {
  return res.render('home');  
});

app.get('/:nickname', async function(req, res) {
  const {nickname} = req.params;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.instagram.com/${nickname}/`);

  const instagram = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('article img');
    const imgArray = [...nodeList];

    const imgList = imgArray.map( ({src}) => ({
      src
    }));

    return imgList;
  });

  await browser.close();

  if(instagram.length === 0) {
    return res.render('404'); 
  }

  return res.render('instagram', {instagram, nickname});
});

app.listen(port, () => {
  console.log("started on", port);
});