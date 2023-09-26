// initial page load's url
function url() {
  return "http://localhost:9000/";
}

// action where you suspect the memory leak might be happening
async function action(page) {
  await page.click('[href="#/table"]');
  await page.click('[data-id="tr0-expand"]');
  await page.click('[data-id="tr1-expand"]');
  await page.click('[data-id="tr3-expand"]');
  await page.click('[data-id="tr4-expand"]');
}

// how to go back to the state before action
async function back(page) {
  await page.click('[href="#/"]');
}

module.exports = { action, back, url };
