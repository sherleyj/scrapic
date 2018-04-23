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
	// Needed to add no sandbox in order to deploy to Heroku.
	// https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    if (pageUrl.slice(0, 8) !== "https://") {
    	pageUrl += "https://";
    }
    try {
	    await page.goto(pageUrl); // the website we want to scrape for images

	    const result = await page.evaluate(() => {
	    	var domain = window.location.hostname;
	    	console.log(domain);
	        const images = document.querySelectorAll("img"); // Select all Images
	        const urls = [];
	        for (var image of images){
	        	var image_url = image.getAttribute("src");
	        	if (image_url.slice(0, 6) === "https:" ||
	        		image_url.slice(0, 4) === "www." ||
	        		image_url.includes(domain.slice(4))) {		// if the url starts with images.example.com. Checks that the url contains "example.com"
	            	urls.push(image_url);
	            }
	            else {
	            	urls.push(domain + image_url);
	            }
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
    	res.render('index', {error: 'Error, Please try again. You probably did not enter a valid URL.', urls: null})
    }
})

app.listen(process.env.PORT || 3030, function () {
  console.log('Example app listening on port 3030!')
})
