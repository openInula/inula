'use strict';

const rimraf = require('rimraf');
const ncp = require('ncp').ncp;
const {existsSync} = require('fs');
const exec = require('child_process').exec;
const {join} = require('path');

const horizonUrl = 'ssh://git@szv-open.codehub.huawei.com:2222/innersource/shanhai/wutong/horizon/horizon-core.git';

function cleanDir() {
  return new Promise(_resolve => rimraf('remote-repo', _resolve));
}

function executeCommand(command, options) {
  return new Promise(_resolve =>
    exec(command, options, error => {
      if (!error) {
        _resolve();
      } else {
        console.error(error);
        process.exit(1);
      }
    })
  );
}

function asyncCopyTo(from, to) {
  return new Promise(_resolve => {
    ncp(from, to, error => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
      _resolve();
    });
  });
}

function getDefaultReactPath() {
  return join(__dirname, 'remote-repo');
}

async function buildBenchmark(reactPath = getDefaultReactPath(), benchmark) {
  // get the build.js from the benchmark directory and execute it
  await require(join(__dirname, 'benchmarks', benchmark, 'build.js'))(
    reactPath,
    asyncCopyTo
  );
}

// async function getMergeBaseFromLocalGitRepo(localRepo) {
//   const repo = await Git.Repository.open(localRepo);
//   return await Git.Merge.base(
//     repo,
//     await repo.getHeadCommit(),
//     await repo.getBranchCommit('main')
//   );
// }

async function buildBenchmarkBundlesFromGitRepo(
  commitId,
  skipBuild,
  url = horizonUrl,
  clean
) {
  let repo;
  const remoteRepoDir = getDefaultReactPath();

  if (!skipBuild) {
    if (clean) {
      //clear remote-repo folder
      await cleanDir(remoteRepoDir);
    }
    // check if remote-repo directory already exists
    if (existsSync(remoteRepoDir)) {
      await executeCommand(`git pull`, { cwd: remoteRepoDir})
    } else {
      // if not, clone the repo to remote-repo folder
      await executeCommand(`git clone ${url} ${remoteRepoDir}`)
    }
    await buildHorizonBundles();
  }
}

async function buildHorizonBundles(horizonPath = getDefaultReactPath(), skipBuild) {
  if (!skipBuild) {
    await executeCommand(
      `cd ${horizonPath} && yarn && yarn build`
    );
  }
}

// if run directly via CLI
// if (require.main === module) {
//   buildBenchmarkBundlesFromGitRepo();
// }

module.exports = {
  buildHorizonBundles,
  buildBenchmark,
  buildBenchmarkBundlesFromGitRepo,
};
