import syntaxDecorators from '@babel/plugin-syntax-decorators';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import syntaxTypescript from '@babel/plugin-syntax-typescript';
import inulaNext from './plugin';
import { type InulaNextOption } from './types';
import { type ConfigAPI, type TransformOptions } from '@babel/core';
import autoNamingPlugin from './sugarPlugins/autoNamingPlugin';
import forSubComponentPlugin from './sugarPlugins/forSubComponentPlugin';
import mapping2ForPlugin from './sugarPlugins/mapping2ForPlugin';
import propsFormatPlugin from './sugarPlugins/propsFormatPlugin';
import stateDestructuringPlugin from './sugarPlugins/stateDestructuringPlugin';
import jsxSlicePlugin from './sugarPlugins/jsxSlicePlugin';
import earlyReturnPlugin from './sugarPlugins/earlyReturnPlugin';
import contextPlugin from './sugarPlugins/contextPlugin';
import hookPlugin from './sugarPlugins/hookPlugin';
import { resetAccessedKeys } from './constants';

const resetImport = {
  visitor: {
    Program: {
      enter() {
        resetAccessedKeys();
      },
    },
  },
};
export default function (_: ConfigAPI, options: InulaNextOption): TransformOptions {
  return {
    plugins: [
      syntaxJSX.default ?? syntaxJSX,
      [syntaxTypescript.default ?? syntaxTypescript, { isTSX: true }],
      [syntaxDecorators.default ?? syntaxDecorators, { legacy: true }],
      resetImport,
      [autoNamingPlugin, options],
      [forSubComponentPlugin, options],
      [mapping2ForPlugin, options],
      [jsxSlicePlugin, options],
      [hookPlugin, options],
      [earlyReturnPlugin, options],
      [inulaNext, options],
    ],
  };
}

export { type InulaNextOption };
