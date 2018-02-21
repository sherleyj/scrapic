// scrapes images from a url and prints them to the console
// uses puppeteer to load the page so we can get images from 
// dynamicly loaded images
const puppeteer = require('puppeteer');

async function scrape_imgs(pageUrl) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

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
};

scrape_imgs("https://www.google.com/").then((value) => {
    console.log(value); // Success!
});