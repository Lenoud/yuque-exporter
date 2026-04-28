import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { autoLogin } from './src/login.js';
import { getAllBooks } from './src/toc.js';
import { exportMarkDownFiles } from './src/export.js';

const color = {
    byNum: (mess, fgNum) => {
        mess = mess || '';
        fgNum = fgNum === undefined ? 31 : fgNum;
        return '[' + fgNum + 'm' + mess + '[39m';
    },
};

async function run() {
    if (!process.env.EXPORT_PATH) {
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        process.env.EXPORT_PATH = outputDir;
        console.log(`EXPORT_PATH not set, using default: ${outputDir}`)
    }

    const cookieFile = './cookies.json';
    const hasCookies = fs.existsSync(cookieFile);
    const browser = await puppeteer.launch({
        headless: hasCookies ? 'new' : false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
        ],
    });
    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        window.chrome = { runtime: {} };
    });
    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await autoLogin(page)
    console.log(color.byNum("Login successfully!", 32))

    console.log("Get book stacks ...")
    const books = await getAllBooks(page)

    console.log("Start export all books ...")
    await exportMarkDownFiles(page, books)

    browser.close()
};

run();
