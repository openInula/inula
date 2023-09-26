/* global browser:writable, page:writable */
import puppeteer from 'puppeteer-core';
import Config from './e2e.config';
import { removeDirSync, comparePicRes } from './util';
import fs from 'fs';
import path from 'path';

before(async () => {
  if (process.env.CREATE_TEST_CASES) {
    removeDirSync(`${path.resolve(__dirname, 'test_cases_pic')}`);
    fs.mkdirSync(`${path.resolve(__dirname, 'test_cases_pic')}`);
  } else {
    removeDirSync(`${path.resolve(__dirname, 'test_diff_pic')}`);
    removeDirSync(`${path.resolve(__dirname, 'new_test_pic')}`);
    fs.mkdirSync(`${path.resolve(__dirname, 'test_diff_pic')}`);
    fs.mkdirSync(`${path.resolve(__dirname, 'new_test_pic')}`);
  }
  
  global.browser = await puppeteer.launch({
    headless: Config.headless,
    executablePath: Config.browserPath,
    args: [`--window-size=${Config.width
      },${Config.height
      }`]
  });
  global.page = await browser.newPage();
  await page.setViewport({ width: Config.width, height: Config.height });

  await page.goto(Config.baseUrl);
})

after(async () => {
  if (Config.closeBrowser) {
    await browser.close();
  }
});

describe('HomePage', function () {
  it('#OpenHomePage', async () => {
    await comparePicRes('OpenHomePage');
  });
});
describe('Layout', function () {
  it('#OpenLayout', async () => {
    await page.goto(`${Config.baseUrl}#/layout`);
    await comparePicRes('Layout');
  });
});
describe('Wizards', function () {
  it('#Previous', async () => {
    await page.goto(`${Config.baseUrl}#/wizards`);
    await page.waitForSelector('body > #root > div > .eui-btn:nth-child(4) > .eui-btn-content')
    await page.click('body > #root > div > .eui-btn:nth-child(4) > .eui-btn-content')
    await comparePicRes('Wizards-Previous');
  });
  it('#Next', async () => {
    await page.waitForSelector('body > #root > div > .eui-btn:nth-child(5) > .eui-btn-content')
    await page.click('body > #root > div > .eui-btn:nth-child(5) > .eui-btn-content')
    await comparePicRes('Wizards-Next');
  });
  it('#Disabled', async () => {
    await page.waitForSelector('body > #root > div > .eui-btn:nth-child(3)')
    await page.click('body > #root > div > .eui-btn:nth-child(3)')
    await comparePicRes('Wizards-Disabled');
  });
});
describe('Table', function () {
  it('#SelectAll', async () => {
    await page.goto(`${Config.baseUrl}#/table`);
    await page.waitForSelector('tbody #eui_checkbox_10000_span')
    await page.click('tbody #eui_checkbox_10000_span')
    await comparePicRes('Table-SelectAll');
  });
  it('#Expand', async () => {
    await page.waitForSelector('.eui_table_tb > tbody > tr:nth-child(1) > .eui_table_cell > .eui_table_expandIcon')
    await page.click('.eui_table_tb > tbody > tr:nth-child(1) > .eui_table_cell > .eui_table_expandIcon')
    await comparePicRes('Table-Expand');
  });
  it('#ColumnConfig', async () => {
    await page.waitForSelector('#root > div > #eui_table_1000 > span > .eui_table_operation')
    await page.click('#root > div > #eui_table_1000 > span > .eui_table_operation')

    await page.waitForSelector('tbody > .eui_doubleSelect_content > .eui_doubleSelect_contentCol > .eui_doubleSelect_contentList > .eui_doubleSelect_contentItem:nth-child(1)')
    await page.click('tbody > .eui_doubleSelect_content > .eui_doubleSelect_contentCol > .eui_doubleSelect_contentList > .eui_doubleSelect_contentItem:nth-child(1)')

    await page.waitForSelector('tbody > .eui_doubleSelect_content > .eui_doubleSelect_midButton > div > .eui_doubleSelect_button_L')
    await page.click('tbody > .eui_doubleSelect_content > .eui_doubleSelect_midButton > div > .eui_doubleSelect_button_L')

    await page.waitForSelector('.eui_Dialog > #dialog_panel > .eui_Dialog_ButtonArea > .eui-btn-primary > .eui-btn-content')
    await page.click('.eui_Dialog > #dialog_panel > .eui_Dialog_ButtonArea > .eui-btn-primary > .eui-btn-content')
    await comparePicRes('Table-ColumnConfig');
  });
});
describe('Tree', function () {
  it('#Expand', async () => {
    await page.goto(`${Config.baseUrl}#/tree`);
    await page.waitForSelector('.eui_tree_expanded > .eui_tree_node_wrapper > .eui_tree > .eui_tree_collapsed:nth-child(1) > .eui_tree_node_wrapper > .eui_tree_node_cont > .eui_tree_hit')
    await page.click('.eui_tree_expanded > .eui_tree_node_wrapper > .eui_tree > .eui_tree_collapsed:nth-child(1) > .eui_tree_node_wrapper > .eui_tree_node_cont > .eui_tree_hit')

    await page.waitForSelector('.eui_tree > .eui_tree_collapsed:nth-child(1) > .eui_tree_node_wrapper > .eui_tree_node_cont > .eui_tree_hit')
    await page.click('.eui_tree > .eui_tree_collapsed:nth-child(1) > .eui_tree_node_wrapper > .eui_tree_node_cont > .eui_tree_hit')

    await page.waitForSelector('.eui_tree > .eui_tree_collapsed > .eui_tree_node_wrapper > .eui_tree_node_cont > .eui_tree_hit')
    await page.click('.eui_tree > .eui_tree_collapsed > .eui_tree_node_wrapper > .eui_tree_node_cont > .eui_tree_hit')
    await comparePicRes('Tree-Expand');
  });
  it('#SelectAll', async () => {
    await page.waitForSelector('.eui_tree_expanded #eui_tree_node_idcheckBox1_span')
    await page.click('.eui_tree_expanded #eui_tree_node_idcheckBox1_span')
    await comparePicRes('Tree-SelectAll');
  });
  it('#UnselectAll', async () => {
    await page.waitForSelector('.eui_tree_expanded #eui_tree_node_idcheckBox1_span')
    await page.click('.eui_tree_expanded #eui_tree_node_idcheckBox1_span')
    await comparePicRes('Tree-UnselectAll');
  });
});
describe('Panel', function () {
  it('#ExpandPanel1', async () => {
    await page.goto(`${Config.baseUrl}#/panel`);
    await page.waitForSelector('div > #eui_Panel_10000 > #eui_PanelItem_10000 > .eui_PanelItem_title > .panelShow')
    await page.click('div > #eui_Panel_10000 > #eui_PanelItem_10000 > .eui_PanelItem_title > .panelShow')

    await page.waitForSelector('div > #eui_Panel_10000 > #eui_PanelItem_10000 > .eui_PanelItem_title > .panelHide')
    await page.click('div > #eui_Panel_10000 > #eui_PanelItem_10000 > .eui_PanelItem_title > .panelHide')
    await comparePicRes('Panel-ExpandPanel1');
  });
  it('#ExpandPanel2', async () => {
    await page.waitForSelector('div > #eui_Panel_10000 > #eui_PanelItem_10001 > .eui_PanelItem_title > .panelHide')
    await page.click('div > #eui_Panel_10000 > #eui_PanelItem_10001 > .eui_PanelItem_title > .panelHide')

    await page.waitForSelector('div > #eui_Panel_10000 > #eui_PanelItem_10001 > .eui_PanelItem_title > .panelShow')
    await page.click('div > #eui_Panel_10000 > #eui_PanelItem_10001 > .eui_PanelItem_title > .panelShow')
    await comparePicRes('Panel-ExpandPanel2');
  });
});
describe('Form', function () {
  it('#Input', async () => {
    await page.goto(`${Config.baseUrl}#/form`);
    await page.waitForSelector('#text-field1 #text-field1_input')
    await page.click('#text-field1 #text-field1_input')
    
    await page.type('#text-field1 #text-field1_input', 'test')
    
    await page.waitForSelector('#text-field2 > .eui_radio_container > #text-field2_radio_1 > div > .eui_radio_span')
    await page.click('#text-field2 > .eui_radio_container > #text-field2_radio_1 > div > .eui_radio_span')
    
    await page.waitForSelector('#text-field3 #text-field3_input')
    await page.click('#text-field3 #text-field3_input')
    
    await page.type('#text-field3 #text-field3_input', '123456')
    
    await page.waitForSelector('#eui_row_10004 > #eui_col_10004 > #toggle1 > .eui_toggle_container > .eui_toggle_track')
    await page.click('#eui_row_10004 > #eui_col_10004 > #toggle1 > .eui_toggle_container > .eui_toggle_track')
    await comparePicRes('Form-Input');
  });
});
