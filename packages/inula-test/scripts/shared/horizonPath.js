const path = require('path');
const fs = require('fs');

const horizonPath = path.resolve(__dirname, '../../../horizon-core');
if (!fs.existsSync(horizonPath)) {
  throw Error('horizon-core not found, 请将 horizon-core 和 horizon-ecosystem 放在同一文件夹下');
}
module.exports = horizonPath;