/* global page:writable */
import resemble from 'resemblejs';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

export function removeDirSync(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  let files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i]);
    let stat = fs.statSync(newPath);
    if (stat.isDirectory()) {
      removeDirSync(newPath);
    } else {
      fs.unlinkSync(newPath);
    }
  }
  fs.rmdirSync(dir);
}

async function comparePic(fileName) {
  if (process.env.CREATE_TEST_CASES) {
    await page.screenshot({
      path: `${path.resolve(__dirname, 'test_cases_pic', fileName)}.png`,
      fullPage: true,
    });
    return 'correct';
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
          resolve(`There are differences(${misMatchPercentage * 100}%) in case "${fileName}".`);
          fs.writeFileSync(path.resolve(__dirname, './test_diff_pic', `${fileName}.png`), data.getBuffer());
        } else {
          resolve('correct');
        }
      });
  });
}

export async function comparePicRes(fileName) {
  const v = await comparePic(fileName);
  assert.ok(v === 'correct', v);
}
