// src/core/parser.ts
import babel from '@babel/core';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import remapping from '@ampproject/remapping';
const traverse = traverseModule.default;
const generate = generateModule.default;

interface TransformOptions {
  filename: string;
  source: string;
  resolveFile: (importPath: string, currentFile: string) => Promise<string | null>;
  readFile: (path: string) => Promise<string>;
}

const LEGACY_WRAPPER = 'withLegacyCompat';
const NEXT_WRAPPER = 'withNextCompat';

export class InulaBridgeParser {
  private cache = new Map<string, boolean>();

  private async isNextFile(filePath: string, readFile: TransformOptions['readFile']): Promise<boolean> {
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath)!;
    }

    try {
      const content = await readFile(filePath);
      const isNext = content.includes('use next');
      this.cache.set(filePath, isNext);
      return isNext;
    } catch (error) {
      return false;
    }
  }

  /**
   * @example
   * import { LegacyWrapper } from '@openinula/bridge'
   *
   * @param ast
   * @param currentFileIsNext
   */
  private addWrapperImport(ast: babel.types.File, currentFileIsNext: boolean) {
    const wrapperName = currentFileIsNext ? NEXT_WRAPPER : LEGACY_WRAPPER;
    const wrapperImport = t.importDeclaration(
      [t.importSpecifier(t.identifier(wrapperName), t.identifier(wrapperName))],
      t.stringLiteral('@openinula/bridge')
    );

    ast.program.body.unshift(wrapperImport);
  }

  /**
   * @example
   * import { Button } from 'a'
   *
   * // 转换后
   * import { Button as __Button } from 'a'
   * const Button = LegacyWrapper(__Button);
   *
   * @param specifier
   * @param currentFileIsNext
   */
  private wrapImports(specifier: babel.types.ImportSpecifier, currentFileIsNext: boolean) {
    const originalName = specifier.local.name;
    const newName = `__${originalName}`;
    specifier.local.name = newName;
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(originalName),
        t.callExpression(t.identifier(currentFileIsNext ? NEXT_WRAPPER : LEGACY_WRAPPER), [t.identifier(newName)])
      ),
    ]);
  }

  async transform({ filename, source, resolveFile, readFile }: TransformOptions) {
    const ast = parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    const currentFileIsNext = await this.isNextFile(filename, readFile);
    let needsWrapper = false;

    // 收集所有需要处理的导入
    const importTasks: Promise<void>[] = [];

    traverse(ast, {
      ImportDeclaration: path => {
        const importPath = path.node.source.value;

        path.node.specifiers.forEach(specifier => {
          // 只处理大写字母开头的导入, 比如 import { Button } from 'a'
          if (
            t.isImportSpecifier(specifier) &&
            t.isIdentifier(specifier.local) &&
            /^[A-Z]/.test(specifier.local.name)
          ) {
            const task = (async () => {
              const resolvedPath = await resolveFile(importPath, filename);
              if (!resolvedPath) return;

              const isNextComponent = await this.isNextFile(resolvedPath, readFile);
              if (isNextComponent !== currentFileIsNext) {
                // 如果导入组件版本和当前组件版本不一致，则需要进行包装
                const wrapperDeclaration = this.wrapImports(specifier, currentFileIsNext);
                path.insertAfter(wrapperDeclaration);
                needsWrapper = true;
              }
            })();
            importTasks.push(task);
          }
        });
      },
    });

    // 等待所有导入处理完成
    await Promise.all(importTasks);

    if (needsWrapper) {
      // Add wrapper import
      this.addWrapperImport(ast, currentFileIsNext);
    }

    const { code: bridgedCode, map: bridgedMap } = generate(ast, {
      sourceMaps: true,
      sourceFileName: filename,
    });

    const result = await transformByMode(filename, currentFileIsNext, bridgedCode, bridgedMap);

    const mergedMap = await mergeSourceMaps(bridgedMap, result!.map);

    return {
      code: result!.code,
      map: mergedMap,
    };
  }
}

async function transformByMode(filename: string, isNext: boolean, bridgedCode: string, bridgedMap: any) {
  if (isNext) {
    return await babel.transformAsync(bridgedCode, {
      filename,
      inputSourceMap: bridgedMap,
      presets: [
        [
          '@openinula/babel-preset-inula-next',
          {
            files: '**/*.{js,jsx,ts,tsx}',
            excludeFiles: '**/{dist,node_modules,lib}/*.{js,ts}',
          },
        ],
      ],
    });
  } else {
    return await babel.transformAsync(bridgedCode, {
      filename,
      inputSourceMap: bridgedMap,
      presets: [
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
            importSource: 'openinula',
          },
        ],
      ],
    });
  }
}

type SourceMap = any;
async function mergeSourceMaps(map1: SourceMap, map2: SourceMap) {
  const result = remapping([rootless(map1), rootless(map2)], () => null);
  if (typeof map1.sourceRoot === 'string') {
    result.sourceRoot = map1.sourceRoot;
  }
  return result;
}

function rootless(map: SourceMap): SourceMap {
  return {
    ...map,
    sourceRoot: null,
  };
}
