// playwright.config.js
module.exports = {
    use: {
        // 设置字符编码和地区
        locale: 'zh-CN',
        timezoneId: 'Asia/Shanghai',
        
        // 浏览器启动参数，支持中文字体
        launchOptions: {
            args: [
                '--lang=zh-CN',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--font-render-hinting=none',
                '--disable-font-subpixel-positioning'
            ]
        },
        
        // 设置用户代理
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    
    // 为不同浏览器设置
    projects: [
        {
            name: 'chromium',
            use: { 
                ...require('@playwright/test').devices['Desktop Chrome'],
                locale: 'zh-CN',
                timezoneId: 'Asia/Shanghai'
            }
        }
    ]
};