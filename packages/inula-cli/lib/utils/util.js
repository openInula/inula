import { dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import resolve from 'resolve';
// @ts-ignore
import crequire from 'crequire';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
function parse(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    return crequire(content)
        .map(o => o.path)
        .filter(path => path.charAt(0) === '.')
        .map(path => resolve.sync(path, {
        basedir: dirname(filePath),
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    }));
}
export function parseRequireDeps(filePath) {
    const paths = [filePath];
    const ret = [filePath];
    while (paths.length) {
        const extraPaths = parse(paths.shift()).filter(path => !ret.includes(path));
        if (extraPaths.length) {
            paths.push(...extraPaths);
            ret.push(...extraPaths);
        }
    }
    return ret;
}
export const isWindows = typeof process !== 'undefined' && process.platform === 'win32';
export function cleanRequireCache(cacheKey) {
    const cachePath = isWindows ? cacheKey.replace(/\//g, '\\') : cacheKey;
    if (require.cache[cachePath]) {
        const cacheParent = require.cache[cachePath].parent;
        let i = (cacheParent === null || cacheParent === void 0 ? void 0 : cacheParent.children.length) || 0;
        while (i--) {
            if (cacheParent.children[i].id === cachePath) {
                cacheParent.children.splice(i, 1);
            }
        }
        delete require.cache[cachePath];
    }
}
export function copyFile(targetPath, sourcePath) {
    try {
        const fileContent = readFileSync(sourcePath);
        writeFileSync(targetPath, fileContent);
    }
    catch (error) {
        console.error('Copy file failed.', error);
    }
}
