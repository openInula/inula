'use strict';
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const horizonEcoPath = path.resolve(__dirname, '../../horizon-ecosystem');
if (!fs.existsSync(horizonEcoPath)) {
  throw Error('horizon-ecosystem not found, put horizon-core and horizon-ecosystem in same folder plz!');
}

const cmd = process.argv[2];
childProcess.exec(
  `npm run ${cmd}`,
  {
    cwd: horizonEcoPath,
  },
  function (error, stdout) {
    if (error) {
      console.log(`Error: ${error}`);
    } else {
      console.log(`STDOUT: ${stdout}`);
    }
  }
);
