const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const inquirer = require('inquirer');
const yeoman = require('yeoman-environment');

const generatorType = fs
  .readdirSync(`${__dirname}/generators`)
  .filter(file => !file.startsWith('.'))
  .map(file => {
    return {
      name: file,
      value: file,
      short: file,
    };
  });

const runGenerator = async (templatePath, { name = '', cwd = process.cwd(), args = {} }) => {
  return new Promise(resolve => {
    if (name) {
      mkdirp.sync(name);
      cwd = path.join(cwd, name);
    }

    const Generator = require(templatePath);
    const env = yeoman.createEnv([], {
      cwd,
    });
    const generator = new Generator({
      name,
      env,
      resolved: require.resolve(templatePath),
      args,
    });
    return generator.run(() => {
      console.log('File Generate Done');
      resolve(true);
    });
  });
};

const run = async config => {
  if (typeof process.send === 'function') {
    process.send({ type: 'prompt' });
  }
  process.emit('message', { type: 'prompt' });

  let { type } = config;
  if (!type) {
    const answers = await inquirer.prompt([
      {
        name: 'type',
        message: 'Please select the template',
        type: 'list',
        choices: generatorType,
      },
    ]);
    type = answers.type;
  }
  const templatePath = `./generators/${type}`;
  try {
    return runGenerator(templatePath, config);
  } catch (e) {
    console.error(chalk.red('> Generate failed'), e);
    process.exit(1);
  }
};

module.exports = run;
