import puppeteer from 'puppeteer';
import dotenv from 'dotenv'; 
import express from 'express';
import fs from 'fs';
import axios from 'axios';

let printer_BW = "printer-279309";
let printer_C = "printer-286287";
const hawkid = "vairen";

const app = express();
app.use(express.json({limit: '50mb'}));

app.post('/upload', async (req, res) => {
    let base64Image = req.body.image;
    console.log(req.body);
    let filePath = 'uploads/image.png';
    fs.writeFileSync(filePath, base64Image, {encoding: 'base64'});

    const browser = await puppeteer.launch({
        // headless: false
    });

    const delay = (s) => {
        return new Promise((res,rej) => {
            setTimeout(() => res(),s);
        });
    }

    const page = await browser.newPage();
    await page.goto("https://printing.its.uiowa.edu");
    await page.type('input#inputUsername', hawkid);
    await page.type('input#inputPassword', `${dotenv.config().parsed.HAWKID_PASSWORD}`);
    await page.click('input[type=submit]');
    console.log("login done");
    await delay(500);
    await page.goto("https://printing.its.uiowa.edu/app?service=action/1/UserWebPrint/0/$ActionLink")
    await delay(500);
    await page.click(`input#${printer_BW}`);
    await page.click('input[type=submit].right');
    console.log("printer selected");
    await delay(200);
    await page.click('input[type=submit].right');
    await delay(200);
    const inputE = await page.$("body > input[type=file]");
    await inputE.uploadFile(filePath);
    await page.click('input[type=submit].right');
    await delay(500);
    console.log("print job submitted");
    // await browser.close();

    res.send('Image uploaded and print job submitted');
});


// SEGMIND
const api_key = "ENTER_KEY_HERE";
const url = "https://api.segmind.com/v1/sdxl1.0-txt2img";

app.post('/segmind', async (req, res) => {
    const data = {
        "prompt": req.body.prompt,
        "style": "base",
        "samples": 1,
        "scheduler": "UniPC",
        "num_inference_steps": 25,
        "guidance_scale": 8,
        "strength": 0.2,
        "seed": 468685,
        "img_width": 1024,
        "img_height": 1024,
        "refiner": true,
        "high_noise_fraction": 0.8,
        "base64": true
    };

    try {
        const response = await axios.post(url, data, { headers: { 'x-api-key': api_key } });

        // Print the HTTP response code
        console.log('HTTP Response Code:', response.status);

        // Assuming the response contains binary image data
        const imageBuffer = Buffer.from(response.data.image, 'base64');
        
        // Check if image.png already exists, if so, create a new file with a different name
        let imageName = 'C:/Users/vedai/Downloads/image.png';
        let counter = 1;
        while (fs.existsSync(imageName)) {
            imageName = `C:/Users/vedai/Downloads/image${counter}.png`;
            counter++;
        }

        // Save the image as 'image.png' or 'image1.png', 'image2.png', etc.
        fs.writeFileSync(imageName, imageBuffer);

        console.log(`Image saved as ${imageName}`);

        // Send the latest image back to the client
        res.sendFile(imageName);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred while processing the image');
    }
});


app.listen(3000, () => console.log('Server started on port 3000'));

