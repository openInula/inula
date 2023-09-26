const port = 3000;

export default {
  browserPath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  headless: false,
  waitTimeout: 500,
  closeBrowser: true,
  width: 1920,
  height: 1080,
  baseUrl: process.env.CREATE_TEST_CASES ? `http://localhost:${port}/react.html` : `http://localhost:${port}/horizon.html`,
};
