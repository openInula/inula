'use strict';

const {spawn} = require('child_process');
const chalk = require('chalk');
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const ossConfig = './scripts/jest/config.source.js';


const argv = yargs
  .parserConfiguration({
    // Important: This option tells yargs to move all other options not
    // specified here into the `_` key. We use this to send all of the
    // Jest options that we don't use through to Jest (like --watch).
    'unknown-options-as-args': true,
  })
  .wrap(yargs.terminalWidth())
  .options({
    debug: {
      alias: 'd',
      describe: 'Run with node debugger attached.',
      requiresArg: false,
      type: 'boolean',
      default: false,
    },
    releaseChannel: {
      alias: 'r',
      describe: 'Run with the given release channel.',
      requiresArg: true,
      type: 'string',
      default: 'experimental',
      choices: ['experimental', 'stable', 'www-classic', 'www-modern', 'horizon'],
    },
    env: {
      alias: 'e',
      describe: 'Run with the given node environment.',
      requiresArg: true,
      type: 'string',
      choices: ['development', 'production'],
    },
    prod: {
      describe: 'Run with NODE_ENV=production.',
      requiresArg: false,
      type: 'boolean',
      default: false,
    },
    dev: {
      describe: 'Run with NODE_ENV=development.',
      requiresArg: false,
      type: 'boolean',
      default: false,
    },
    build: {
      alias: 'b',
      describe: 'Run tests on builds.',
      requiresArg: false,
      type: 'boolean',
      default: false,
    },
  }).argv;

function logError(message) {
  console.error(chalk.red(`\n${message}`));
}


function validateOptions() {
  let success = true;

  if (argv.project === 'devtools') {
    if (argv.prod) {
      logError(
        'DevTool tests do not support --prod. Remove this option to continue.'
      );
      success = false;
    }

    if (argv.dev) {
      logError(
        'DevTool tests do not support --dev. Remove this option to continue.'
      );
      success = false;
    }

    if (argv.env) {
      logError(
        'DevTool tests do not support --env. Remove this option to continue.'
      );
      success = false;
    }

    if (!argv.build) {
      logError('DevTool tests require --build.');
      success = false;
    }
  }


  if (argv.env && argv.env !== 'production' && argv.prod) {
    logError(
      'Build type does not match --prod. Update these options to continue.'
    );
    success = false;
  }

  if (argv.env && argv.env !== 'development' && argv.dev) {
    logError(
      'Build type does not match --dev. Update these options to continue.'
    );
    success = false;
  }

  if (argv.prod && argv.dev) {
    logError(
      'Cannot supply both --prod and --dev. Remove one of these options to continue.'
    );
    success = false;
  }

  if (argv.build) {
    // TODO: We could build this if it hasn't been built yet.
    const buildDir = path.resolve('./build');
    if (!fs.existsSync(buildDir)) {
      logError(
        'Build directory does not exist, please run `yarn build` or remove the --build option.'
      );
      success = false;
    } else if (Date.now() - fs.statSync(buildDir).mtimeMs > 1000 * 60 * 15) {
      logError(
        'Warning: Running a build test with a build directory older than 15 minutes.\nPlease remember to run `yarn build` when using --build.'
      );
    }
  }

  if (!success) {
    console.log(''); // Extra newline.
    process.exit(1);
  }
}

function getCommandArgs() {
  // Add the correct Jest config.
  const args = ['./scripts/jest/jest.js', '--config'];
  args.push(ossConfig);

  // Set the debug options, if necessary.
  if (argv.debug) {
    args.unshift('--inspect-brk');
    args.push('--runInBand');
  }

  // Push the remaining args onto the command.
  // This will send args like `--watch` to Jest.
  args.push(...argv._);

  return args;
}

function getEnvars() {
  const envars = {
    NODE_ENV: argv.env || 'development',
    RELEASE_CHANNEL: argv.releaseChannel.match(/modern|experimental/)
      ? 'experimental'
      : 'stable',
  };

  if (argv.prod) {
    envars.NODE_ENV = 'production';
  }

  if (argv.dev) {
    envars.NODE_ENV = 'development';
  }

  return envars;
}

function main() {
  validateOptions();
  const args = getCommandArgs();
  const envars = getEnvars();

  // Print the full command we're actually running.
  console.log(
    chalk.dim(
      `$ ${Object.keys(envars)
        .map(envar => `${envar}=${envars[envar]}`)
        .join(' ')}`,
      'node',
      args.join(' ')
    )
  );

  // Print the release channel and project we're running for quick confirmation.
  console.log(
    chalk.blue(
      `\nRunning tests for ${argv.project} (${argv.releaseChannel})...`
    )
  );

  // Print a message that the debugger is starting just
  // for some extra feedback when running the debugger.
  if (argv.debug) {
    console.log(chalk.green('\nStarting debugger...'));
    console.log(chalk.green('Open chrome://inspect and press "inspect"\n'));
  }

  // Run Jest.
  const jest = spawn('node', args, {
    stdio: 'inherit',
    env: {...envars, ...process.env},
  });
  // Ensure we close our process when we get a failure case.
  jest.on('close', code => {
    // Forward the exit code from the Jest process.
    if (code === 1) {
      process.exit(1);
    }
  });
}

main();
