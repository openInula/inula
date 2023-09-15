import chalk from 'chalk';
import lodash from 'lodash';

function getDescriptions(commands: any) {
  return Object.keys(commands)
    .filter(name => typeof commands[name] !== 'string')
    .map(name => {
      return getDescription(commands[name]);
    });
}

function getDescription(command: any) {
  return `    ${chalk.green(lodash.padEnd(command.name, 10))}${command.description || ''}`;
}

function padLeft(str: string) {
  return str
    .split('\n')
    .map((line: string) => `    ${line}`)
    .join('\n');
}

export default (api: any) => {
  api.registerCommand({
    name: 'help',
    description: 'show command helps',

    fn: (args: any, config: any) => {
      console.log(`
      Usage: inula-cli <command> [options]

${getDescriptions(api.commands).join('\n')}
          `);
    },
  });
};
