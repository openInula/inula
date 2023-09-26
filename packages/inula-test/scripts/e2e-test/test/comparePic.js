/* global page:writable */
import resemble from 'resemblejs';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

async function comparePic(fileName) {
  if (process.env.CREATE_TEST_CASES) {
    await page.screenshot({
      path: `${path.resolve(__dirname, 'test_cases_pic', fileName)}.png`,
      fullPage: true,
    });
    return 0;
  }
  await page.screenshot({
    path: `${path.resolve(__dirname, 'new_test_pic', fileName)}.png`,
    fullPage: true,
  });
  return new Promise((resolve, reject) => {
    const fileData1 = fs.readFileSync(path.resolve(__dirname, './test_cases_pic', `${fileName}.png`));
    const fileData2 = fs.readFileSync(path.resolve(__dirname, './new_test_pic', `${fileName}.png`));
    resemble(fileData1)
      .compareTo(fileData2)
      .ignoreColors()
      .onComplete(data => {
        const misMatchPercentage = +data.misMatchPercentage;
        if (misMatchPercentage !== 0) {
          resolve(+data.misMatchPercentage);
          fs.writeFileSync(path.resolve(__dirname, './test_diff_pic', `${fileName}.png`), data.getBuffer());
        } else {
          resolve(+data.misMatchPercentage);
        }
      });
  });
}

export default async function comparePicRes(fileName) {
  const v = await comparePic(fileName);
  assert.strictEqual(v, 0);
}
