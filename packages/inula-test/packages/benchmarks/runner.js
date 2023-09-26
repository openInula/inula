'use strict';

const {readdirSync, statSync} = require('fs');
const {join} = require('path');
const horizonPath = require('../../scripts/shared/horizonPath')
const runBenchmark = require('./benchmark');
const {
  buildHorizonBundles,
  buildBenchmark,
  buildBenchmarkBundlesFromGitRepo,
  getMergeBaseFromLocalGitRepo,
} = require('./build');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const printResults = require('./stats');
const serveBenchmark = require('./server');

function getBenchmarkNames() {
  return readdirSync(join(__dirname, 'benchmarks')).filter(file =>
    statSync(join(__dirname, 'benchmarks', file)).isDirectory()
  );
}

function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
}

const runRemote = argv.remote;
const runLocal = argv.local;
const benchmarkFilter = argv.benchmark;
const headless = argv.headless;
const skipBuild = argv['skip-build'];

async function runBenchmarks(horizonPath) {
  const benchmarkNames = getBenchmarkNames();
  const results = {};
  const server = serveBenchmark();
  await wait(1000);

  for (let i = 0; i < benchmarkNames.length; i++) {
    const benchmarkName = benchmarkNames[i];

    if (
      !benchmarkFilter ||
      (benchmarkFilter && benchmarkName.indexOf(benchmarkFilter) !== -1)
    ) {
      console.log(
        chalk.gray(`- Building benchmark "${chalk.white(benchmarkName)}"...`)
      );
      await buildBenchmark(horizonPath, benchmarkName);
      console.log(
        chalk.gray(`- Running benchmark "${chalk.white(benchmarkName)}"...`)
      );
      results[benchmarkName] = await runBenchmark(benchmarkName, headless);
    }
  }

  await wait(500);

  server.close();
  // http-server.close() is async but they don't provide a callback..
  await wait(500);
  return results;
}

// get the performance benchmark results
// from remote main (default React repo)
async function benchmarkRemoteMaster() {
  console.log(chalk.gray(`- Building Horizon Remote bundles...`));
  let commit = argv.remote;

  await buildBenchmarkBundlesFromGitRepo(commit, skipBuild);
  return {
    benchmarks: await runBenchmarks(),
  };
}

// get the performance benchmark results
// of the local react repo
async function benchmarkLocal(horizonPath) {
  console.log(chalk.gray(`- Building Horizon bundles...`));
  await buildHorizonBundles(horizonPath, skipBuild);
  return {
    benchmarks: await runBenchmarks(horizonPath),
  };
}

async function runLocalBenchmarks(showResults) {
  console.log(
    chalk.white.bold('Running benchmarks for ') +
      chalk.green.bold('Local (Current Branch)')
  );
  const localResults = await benchmarkLocal(horizonPath);

  if (showResults) {
    printResults(localResults, null);
  }
  return localResults;
}

async function runRemoteBenchmarks(showResults) {
  console.log(
    chalk.white.bold('Running benchmarks for ') +
      chalk.yellow.bold('Remote (Merge Base)')
  );
  const remoteMasterResults = await benchmarkRemoteMaster();

  if (showResults) {
    printResults(null, remoteMasterResults);
  }
  return remoteMasterResults;
}

async function compareLocalToMaster() {
  console.log(
    chalk.white.bold('Comparing ') +
      chalk.green.bold('Local (Current Branch)') +
      chalk.white.bold(' to ') +
      chalk.yellow.bold('Remote (Merge Base)')
  );
  const localResults = await runLocalBenchmarks(false);
  const remoteMasterResults = await runRemoteBenchmarks(false);
  printResults(localResults, remoteMasterResults);
}

if ((runLocal && runRemote) || (!runLocal && !runRemote)) {
  compareLocalToMaster().then(() => process.exit(0));
} else if (runLocal) {
  runLocalBenchmarks(true).then(() => process.exit(0));
} else if (runRemote) {
  runRemoteBenchmarks(true).then(() => process.exit(0));
}
