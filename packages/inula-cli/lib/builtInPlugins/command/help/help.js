import chalk from 'chalk';
import lodash from 'lodash';
function getDescriptions(commands) {
    return Object.keys(commands)
        .filter(name => typeof commands[name] !== 'string')
        .map(name => {
        return getDescription(commands[name]);
    });
}
function getDescription(command) {
    return `    ${chalk.green(lodash.padEnd(command.name, 10))}${command.description || ''}`;
}
function padLeft(str) {
    return str
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n');
}
export default (api) => {
    api.registerCommand({
        name: 'help',
        description: 'show command helps',
        fn: (args, config) => {
            console.log(`
      Usage: inula-cli <command> [options]

${getDescriptions(api.commands).join('\n')}
          `);
        },
    });
};
