const { globSync } = require('glob');
const { lstatSync, readFileSync } = require('fs');
const { resolve } = require('path');

function similarity(s1, s2) {
  if (s1 === s2) return 1;
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function percent(val) {
  return Math.round(val * 10000) / 100;
}

function getFiles(basePath, whitelist, blacklist = []) {
  const globNames = globSync(whitelist, { cwd: basePath, ignore: blacklist, recursive: true }).filter(item => {
    return !lstatSync(resolve(basePath, item)).isDirectory();
  });
  //   globNames.forEach(name => console.log(name));

  return globNames;
}

const config = JSON.parse(readFileSync('./conversion.config.json'));

const horizonPath = config.src;
const vuePath = config.src.replace('dmc-website-horizon', 'dmc-website');

const horizonFiles = getFiles(horizonPath, config.whitelist, config.blacklist);

const vueFiles = getFiles(vuePath, config.whitelist, config.blacklist);

const intersectionFiles = horizonFiles.filter(filename => vueFiles.includes(filename));

let totalLength = 0;
let totalSimilarLength = 0;

intersectionFiles.forEach((file, index) => {
  const horizonFile = readFileSync(resolve(horizonPath, file), 'utf-8');
  const vueFile = readFileSync(resolve(vuePath, file), 'utf-8');
  const fileLength = Math.max(horizonFile.length, vueFile.length);
  const value = percent(similarity(horizonFile, vueFile));
  totalLength += fileLength;
  totalSimilarLength += (fileLength * value) / 100;
  console.log(`[${index + 1}/${intersectionFiles.length}]: ${value < 70 ? '!!!' : '✔'} ${file}: ${value}`);
});
console.log('total files: ', intersectionFiles.length);
console.log('total match: ', Math.round((totalSimilarLength / totalLength) * 10000) / 100);
