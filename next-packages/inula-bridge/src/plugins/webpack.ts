import path from 'path';
import { InulaBridgeParser } from './core/parser';
import type { LoaderContext } from 'webpack';

async function ReactBridgeWebpackLoader(this: LoaderContext<any>, source: string, sourceMap: any) {
  const callback = this.async();
  const parser = new InulaBridgeParser();

  try {
    const resolveFile = async (importPath: string, currentFile: string) => {
      return new Promise<string | null>(resolve => {
        this.resolve(path.dirname(currentFile), importPath, (err, result) => {
          if (err || !result) {
            resolve(null);
            return;
          }
          resolve(result);
        });
      });
    };

    const readFile = async (filePath: string) => {
      return new Promise<string>(resolve => {
        this.loadModule(filePath, (err, source) => {
          if (err || !source) {
            resolve('');
            return;
          }
          resolve(source.toString());
        });
      });
    };

    const transformed = await parser.transform({
      filename: this.resourcePath,
      source,
      resolveFile,
      readFile,
    });

    callback(null, transformed, sourceMap);
  } catch (err) {
    callback(err as Error);
  }
}

// 导出 loader
export default ReactBridgeWebpackLoader;
