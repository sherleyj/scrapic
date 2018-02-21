const express = require('express');
const bodyParser = require('body-parser');
// var scrape_imgs = require('./scrape_imgs.js');
const puppeteer = require('puppeteer');
const app = express()
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {error: null, urls: null});
})

async function scrape_imgs(pageUrl) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
	    await page.goto(pageUrl); // the website we want to scrape for images

	    const result = await page.evaluate(() => {
	        const images = document.querySelectorAll("img"); // Select all Images
	        const urls = [];
	        for (var image of images){
	            urls.push(image.getAttribute("src"));
	        }
	        return urls; // Return array of image urls
	    });
	    await browser.close();
        return result; 
	}
	catch(e){
		console.log(e);
		await browser.close();
		return null;
	}

};

app.post('/', async function (req, res) {
  let pageUrl = req.body.url_to_parse;	
  let urls = await scrape_imgs(pageUrl);

    if(urls != null){
    	res.render('index', {error: null, urls: urls})
    } else {
    	res.render('index', {error: 'Error, Please try again. You probaly did not enter a valid URL.', urls: null})
    }
})

app.listen(3030, function () {
  console.log('Example app listening on port 3030!')
})