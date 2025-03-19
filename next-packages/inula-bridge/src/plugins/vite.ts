import type { Plugin } from 'vite';
import { InulaBridgeParser } from './core/parser';
import fs from 'fs/promises';
import reactPlugin from '@vitejs/plugin-react';
import nextPlugin from '@openinula/unplugin/vite';
import { transform } from '@babel/core';

const next = nextPlugin();
// first is react plugin, second is react-refresh plugin
const react = reactPlugin({
  jsxRuntime: 'automatic',
  jsxImportSource: 'openinula',
  fastRefresh: false,
})[0] as Plugin;

export function InulaBridge(): Plugin {
  const parser = new InulaBridgeParser();

  return {
    name: 'vite-plugin-inula-bridge',
    enforce: 'pre',

    async transform(code, id) {
      if (!id.endsWith('.ts') && !id.endsWith('.tsx') && !id.endsWith('.jsx')) {
        return null;
      }

      const resolveFile = async (importPath: string, currentFile: string) => {
        try {
          // 使用 Vite 的 resolve 钩子解析模块
          const resolved = await this.resolve(importPath, currentFile);
          if (!resolved) return null;

          // 获取实际文件路径
          return resolved.id;
        } catch {
          return null;
        }
      };

      const readFile = async (filePath: string) => {
        try {
          // 使用 Vite 的 load 钩子读取文件
          return await fs.readFile(filePath, 'utf-8');
        } catch {
          return '';
        }
      };

      const bridgeResult = await parser.transform({
        filename: id,
        source: code,
        resolveFile,
        readFile,
      });

      return bridgeResult;
    },
  };
}
