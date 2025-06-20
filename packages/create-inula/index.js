#! /usr/bin/env node

const yParser = require('yargs-parser');
const chalk = require('chalk');
const run = require('./lib/run');
const lodash = require('lodash');
const version = require('./package.json').version;

const commands = [{ name: '-v', description: 'show version' }];

// args 为文件名后所有输入
const args = yParser(process.argv.slice(2));

if (args.v || args._[0] === 'version') {
  console.log(version);
  process.exit(0);
}

if (args.h || args._[0] === 'help') {
  console.log(`
      Usage: create-inula <command> [options]

${getDescriptions(commands).join('\n')}
          `);
  process.exit(0);
}

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

function getDescription(command) {
  return `      ${chalk.green(lodash.padEnd(command.name, 10))}${command.description || ''}`;
}

function getDescriptions(commands) {
  return Object.keys(commands)
    .filter(name => typeof commands[name] !== 'string')
    .map(name => {
      return getDescription(commands[name]);
    });
}
