#! /usr/bin/env node

const yParser = require('yargs-parser');
const run = require('./lib/run');

// args 为文件名后所有输入
const args = yParser(process.argv.slice(2));

const name = args._[0] || '';

const { type } = args;
delete args.type;

(async () => {
  await run({
    name,
    type,
    args,
  });
  process.exit(0);
})();
