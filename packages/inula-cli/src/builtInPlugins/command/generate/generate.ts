import { API } from '../../../types/types';
import yargsParser from 'yargs-parser';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { copyFile } from '../../../utils/util.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (api: API) => {
  api.registerCommand({
    name: 'generate',
    description: 'generate template',
    fn: async (args: yargsParser.Arguments) => {
      if (args._[0] === 'g') {
        args._.shift();
      }
      if (args._.length === 0) {
        api.logger.warn("Can't find any generate options.");
        return;
      }

      switch (args._[0]) {
        case 'jest':
          args._.shift();
          const isESM = api.packageJson['type'] === 'module';
          await generateJest(args, api.cwd, isESM);
      }
    },
  });
};

const generateJest = async (args: yargsParser.Arguments, cwd: string, isESM: boolean) => {
  let isTs: boolean = false;
  if (args['ts']) {
    isTs = true;
  } else {
    const answers = await inquirer.prompt([
      {
        name: 'useTs',
        message: 'Do you want to use TypeScript',
        type: 'confirm',
      },
    ]);
    isTs = answers['useTs'];
  }

  if (checkJestConfigExist(cwd)) {
    console.log('The jest config is exist.');
    return;
  }

  const testRootPath = path.join(cwd, 'test');

  if (!fs.existsSync(testRootPath)) {
    fs.mkdirSync(testRootPath);
  }

  let templateDir = path.resolve(__dirname, '../../../../template/test');

  // 如果是TS, 拷贝ts
  if (isTs) {
    templateDir = path.join(templateDir, 'ts');
    copyTestTemplate(cwd, testRootPath, templateDir);
  }

  // 拷贝mjs
  if (!isTs && isESM) {
    templateDir = path.join(templateDir, 'mjs');
    copyTestTemplate(cwd, testRootPath, templateDir);
  }

  // 拷贝cjs
  if (!isTs && !isESM) {
    templateDir = path.join(templateDir, 'cjs');
    copyTestTemplate(cwd, testRootPath, templateDir);
  }
};

function checkJestConfigExist(cwd: string): boolean {
  const items = fs.readdirSync(cwd);
  for (const item of items) {
    const itemPath = path.resolve(cwd, item);
    const states = fs.statSync(itemPath);
    if (states.isFile() && item.startsWith('jest.config')) {
      return true;
    }
  }
  return false;
}

function copyTestTemplate(cwd: string, testRootPath: string, templateDir: string) {
  const items = fs.readdirSync(templateDir);
  for (const item of items) {
    const itemPath = path.resolve(templateDir, item);
    if (item.startsWith('jest.config')) {
      copyFile(path.join(cwd, item), itemPath);
    } else {
      copyFile(path.join(testRootPath, item), itemPath);
    }
  }
}
