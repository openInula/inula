var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from 'path';
import fs from 'fs';
import { build as esbuild } from 'esbuild';
const buildConfig = (fileName, format = 'esm') => __awaiter(void 0, void 0, void 0, function* () {
    // 外部依赖不构建参与构建，减少执行时间
    const pluginExternalDeps = {
        name: 'plugin-external-deps',
        setup(build) {
            build.onResolve({ filter: /.*/ }, args => {
                const id = args.path;
                if (id[0] !== '.' && !path.isAbsolute(id)) {
                    return {
                        external: true,
                    };
                }
                return {};
            });
        },
    };
    // 将文件中的路径改成确定路径，避免执行时调用错误
    const pluginReplaceImport = {
        name: 'plugin-replace-import-meta',
        setup(build) {
            build.onLoad({ filter: /\.[jt]s$/ }, args => {
                const contents = fs.readFileSync(args.path, 'utf8');
                // 替换import路径
                contents.replace(/\bimport\.meta\.url\b/g, JSON.stringify(`file://${args.path}`));
                // 替换当前目录路径
                contents.replace(/\b__dirname\b/g, JSON.stringify(path.dirname(args.path)));
                // 替换当前文件路径
                contents.replace(/\b__filename\b/g, JSON.stringify(args.path));
                return {
                    loader: args.path.endsWith('.ts') ? 'ts' : 'js',
                    contents: contents
                };
            });
        },
    };
    const result = yield esbuild({
        entryPoints: [fileName],
        outfile: 'out.js',
        write: false,
        platform: 'node',
        bundle: true,
        format,
        metafile: true,
        plugins: [pluginExternalDeps, pluginReplaceImport],
    });
    const { text } = result.outputFiles[0];
    return text;
});
export default buildConfig;
