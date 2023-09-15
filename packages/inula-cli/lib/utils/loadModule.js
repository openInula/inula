var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { join, isAbsolute } from 'path';
import fs from 'fs';
import buildConfig from './build.js';
import { createRequire } from 'module';
import dynamicImport from './dynamicImport.js';
const require = createRequire(import.meta.url);
export function loadModule(filePath) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        filePath = isAbsolute(filePath) ? filePath : join(process.cwd(), filePath);
        const isTsFile = filePath.endsWith('ts');
        const isJsFile = filePath.endsWith('js');
        let content;
        // js文件，可以直接通过import引用
        if (isJsFile) {
            content = (_a = (yield dynamicImport(filePath))) === null || _a === void 0 ? void 0 : _a.default;
        }
        // 如果是ts文件，需要先转为js文件，再读取
        if (isTsFile) {
            const code = yield buildConfig(filePath, 'esm');
            content = yield getTypescriptModule(code, filePath);
        }
        return content;
    });
}
function getTypescriptModule(code, filePath, isEsm = true) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const tempFile = `${filePath}.${isEsm ? 'm' : 'c'}js`;
        let content = null;
        // todo 臨時文件管理
        fs.writeFileSync(tempFile, code);
        delete require.cache[require.resolve(tempFile)];
        try {
            const raw = isEsm ? yield dynamicImport(tempFile) : require(tempFile);
            content = (_a = raw === null || raw === void 0 ? void 0 : raw.default) !== null && _a !== void 0 ? _a : raw;
        }
        catch (err) {
            fs.unlinkSync(tempFile);
            if (err instanceof Error) {
                err.message = err.message.replace(tempFile, filePath);
                err.stack = (_b = err.stack) === null || _b === void 0 ? void 0 : _b.replace(tempFile, filePath);
            }
            throw err;
        }
        // todo 刪除失敗加日誌
        fs.unlinkSync(tempFile);
        return content;
    });
}
