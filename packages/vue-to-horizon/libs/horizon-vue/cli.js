#! /usr/bin/env node
import { resolve as _resolve, dirname } from 'path';
import { existsSync, readFileSync, writeFileSync, statSync, rmSync, copyFileSync } from 'fs';
import compileFiles from './src/compileFiles.js';
import { spawnSync, spawn } from 'child_process';
import { watch } from 'fs';
import sw from './src/sw.js';
const { start, log } = sw;
import copyTemplate from './src/copyTemplate.js';

// TODO: new args
const argsDefinition = {
  src: 'path to vue sources folder. All .vue files in this folder and subfolders will be converted to jsx format.',
  out: 'path to folder where the new converted project will be created.',
  fast: 'quick build when only converted templates changed. does not re-build horizon or copy any adapters.',
  config: 'alternative flag to specify config file containing source, output, whitelist and blacklist',
  whitelist: [],
  blacklist: [],
};

const actionDefinition = {
  convert: 'converts the vue source to jsx.',
  run: 'converts and starts a dev server',
  watch: 'converts, starts a dev server and watches for changes',
};

const currentPath = _resolve(process.cwd());

/***
 * 上次构建时间
 */
function getLastBuildTimestamp(out) {
  try {
    const filepath = _resolve(out, './main.js');
    console.log({ out, filepath });
    const { mtime: modified } = statSync(filepath);
    return new Date(modified).getTime();
  } catch {
    return -1;
  }
}

function parseArgs(args) {
  const options = {};
  let action = null;
  let currentKey = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (Object.keys(actionDefinition).includes(arg)) {
      action = arg;
      currentKey = null;
    }

    if (arg.startsWith('--')) {
      if (currentKey && !options[currentKey]) {
        options[currentKey] = true;
        currentKey = arg.slice(2);
      } else {
        currentKey = arg.slice(2);
      }
    } else if (currentKey) {
      options[currentKey] = arg;
      currentKey = null;
    }
  }

  if (currentKey && !options[currentKey]) {
    options[currentKey] = true;
  }

  console.log({ args, options, action });

  let configPath = options.config && _resolve(currentPath, options.config);

  console.log({ configPath, currentPath, options_config: options.config });

  if (options.config && existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath));
      console.log({ config });
      Object.entries(config).forEach(([key, value]) => {
        console.log({ key });
        if (key == 'src') {
          options.src = options.src || _resolve(dirname(configPath), value);
        } else if (key == 'out') {
          options.out = options.out || _resolve(dirname(configPath), value);
        } else {
          options[key] = value;
        }
      });
    } catch (err) {
      throw Error('failed to read config', err);
    }
  }

  console.log('OPTIONS:', JSON.stringify({ options, action }, null, 2));

  return { options, action };
}

function printUsage() {
  console.log('Usage:');
  console.log('  horizon2vue [--option [value]] <action>');
  console.log('\nOptions:');
  for (const key in argsDefinition) {
    console.log(`  --${key}:\t${argsDefinition[key]}`);
  }
  console.log('\nActions:');
  for (const key in actionDefinition) {
    console.log(`  --${key}:\t${actionDefinition[key]}`);
  }
}

function validateArgs(options, action) {
  console.log({ src: options.src, out: options.out });
  if (!options.src) {
    console.error('Please define source folder of vue files using --src <path>');
    printUsage();
    process.exit(1);
  }
  if (!existsSync(_resolve(options.src))) {
    console.error('Invalid source path: ' + _resolve(options.src) + ' does not exist!');
    printUsage();
    process.exit(1);
  }
  if (action === 'convert' && !options.out) {
    console.error('Please define output folder of converted project --out <path>');
    printUsage();
    process.exit(1);
  }
}

function handleAction(action, options) {
  if (!action) {
    action = 'run';
  }
  switch (action) {
    case 'convert':
      convert(options);
      break;
    case 'run':
      convert(options);
      // run(options);
      break;
    case 'watch':
      convert(options);
      new Promise(resolve => {
        watchAction(options);
        resolve();
      }).then(() => {});
      new Promise(resolve => {
        run(options);
        resolve();
      }).then(() => {});
      break;
  }
}

function enhancePackage(packagePath, additionalDependencies) {
  console.log({ additionalDependencies, packagePath });
  let newPackage = {};

  try {
    newPackage = JSON.parse(readFileSync(packagePath));
    if (additionalDependencies) {
      Object.entries(additionalDependencies).forEach(([key, value]) => {
        newPackage.dependencies[key] = value;
      });

      Object.entries(additionalDependencies)?.forEach(dep => {
        if (Array.isArray(dep)) {
          newPackage.dependencies[dep[0]] = dep[1];
        } else {
          newPackage.dependencies[dep] = '^1.0.0';
        }
      });
    }

    writeFileSync(packagePath, JSON.stringify(newPackage, null, 2), { encoding: 'utf8', flag: 'w' });
  } catch (err) {
    console.log('failed to read package.json', err);
  }
}

function convert(options) {
  const lastBuild = getLastBuildTimestamp(options.out);
  console.log(`convert: ${JSON.stringify({ ...options, lastBuild })}`);

  //TODO  fast命令已经剔除，后续需要加上，提供一个增量转换覆盖的能力
  if (!options.fast) {
    if (existsSync(options.config)) {
      try {
        const rawConfig = readFileSync(options.config);
        //  const conversionConfig = JSON.parse(rawConfig);
      } catch (err) {
        throw Error('Failed to read config: ', err);
      }
    } else {
      console.log('-using old directory');
    }
  }

  let handle = start('full copy template');

  // 复制模板工程（模板工程包含了工程基本的配置，依赖包等）
  copyTemplate(_resolve(options.out), options.fast);

  log(handle);
  handle = start('compile files');
  // 编译入口
  compileFiles(options.src, options.out + '/convert', {
    jsx: true,
    clean: options.clean,
    whitelist: options.whitelist,
    blacklist: options.blacklist,
    componentConfigPath: options.comp,
    configPath: options.config,
    lastBuild,
  });
  log(handle);

  const configPathSrc = _resolve(options.src, '..');
  const configPathOut = _resolve(options.out);
  console.log('should replace config:', {
    path: _resolve(configPathSrc, 'webpackConfig.js'),
    target: _resolve(configPathOut, 'webpack.config.js'),
    shouldChange: existsSync(_resolve(configPathSrc, 'webpackConfig.js')),
    targetExists: existsSync(_resolve(configPathOut, 'webpack.config.js')),
  });
  if (existsSync(_resolve(configPathSrc, 'webpackConfig.js'))) {
    rmSync(_resolve(configPathOut, 'webpack.config.js'));
    copyFileSync(_resolve(configPathSrc, 'webpackConfig.js'), _resolve(configPathOut, 'webpack.config.js'));
  }
}

/**
 * 转换后进行工程的自动install
 * @param {*} options
 */
function buildTemplate(options) {
  let configPath = options.config && _resolve(currentPath, options.config);
  const config = options.config ? JSON.parse(readFileSync(configPath)) : {};
  let handle = start('enhance package');
  enhancePackage(options.out + '/package.json', config?.additionalDependencies);
  log(handle);
  handle = start('Build template');
  if (!options.fast) {
    let handle = start('Install packages');
    spawnSync(' npmi', {
      cwd: options.out,
      shell: true,
      stdio: 'inherit',
    });
    log(handle);
  } else {
    console.log('-skipping npm i');
  }
  spawnSync('npm run build', {
    cwd: options.out,
    shell: true,
    stdio: 'inherit',
  });
  log(handle);
}

function serveTemplate(options) {
  spawn('npm run serve', {
    cwd: options.out,
    shell: true,
    stdio: 'inherit',
  });
}

function run(options) {
  buildTemplate(options);
  serveTemplate(options);
}

function watchAction(options) {
  let watchFiles = {};
  let rebuildSchedule = null;
  watch(options.src, { recursive: true }, function (evt, name) {
    if (watchFiles[name]) return;
    if (rebuildSchedule) {
      clearTimeout(rebuildSchedule);
    }
    watchFiles[name] = true;
    rebuildSchedule = setTimeout(() => {
      convert(options);
      buildTemplate();
      watchFiles = {};
    }, 5);
  });
}

/**
 * option : --src ./libs/horizon-examples/vue-basic-example/src --out ./libs/horizon-examples/build/vue-basic-example
 * action : run/watch
 */
function main() {
  let handle = start('main');
  const args = process.argv.slice(2);
  const { options, action } = parseArgs(args);
  console.log('main: ' + JSON.stringify({ action, options }));
  validateArgs(options, action);
  handleAction(action, options);
  log(handle);
}

main();
