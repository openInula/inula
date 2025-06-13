import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { API } from '../../../types/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
interface PackageJson {
  version: string;
}

const pkgPath = path.resolve(__dirname, '../../../../package.json');

// 读取 package.json 文件
const packageJson = fs.readFileSync(pkgPath, 'utf8');

// 解析 JSON 格式的数据
const packageData: PackageJson = JSON.parse(packageJson);

// 获取版本号
const version = packageData.version;

export default (api: API) => {
  api.registerCommand({
    name: 'version',
    description: 'show inula-cli version',
    fn: () => {
      api.logger.info(`Inula-cli version is ${version}.`);
    },
  });
};
