import fs from 'fs';

export async function autoLogin(page) {
    const cookieFile = './cookies.json';
    let cookies = [];
    if (fs.existsSync(cookieFile)) {
        const cookiesString = fs.readFileSync(cookieFile);
        cookies = JSON.parse(cookiesString);
    }

    // 如果存在 cookie，则直接加载
    if (cookies.length > 0) {
      console.log("Login use cookies...")
      await page.setCookie(...cookies);
      await page.goto('https://www.yuque.com/dashboard');
    } else {
      console.log("No cookies found, opening browser for manual login...")
      console.log("Please login in the browser window, then the script will continue automatically.")

      await page.goto('https://www.yuque.com/login', { waitUntil: 'networkidle2' });

      // Wait for user to manually login and navigate to dashboard
      await page.waitForNavigation({ timeout: 120000 });

      // 保存 cookie 到本地文件
      cookies = await page.cookies();
      fs.writeFileSync(cookieFile, JSON.stringify(cookies));

      console.log("Save cookie to cookies.json")
    }
}
