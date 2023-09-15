import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgPath = path.resolve(__dirname, '../../../../package.json');
// 读取 package.json 文件
const packageJson = fs.readFileSync(pkgPath, 'utf8');
// 解析 JSON 格式的数据
const packageData = JSON.parse(packageJson);
// 获取版本号
const version = packageData.version;
export default (api) => {
    api.registerCommand({
        name: 'version',
        description: 'show inula-cli version',
        fn: () => {
            api.logger.info(`Inula-cli version is ${version}.`);
        },
    });
};
