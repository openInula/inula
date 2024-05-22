import syntaxDecorators from '@babel/plugin-syntax-decorators';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import syntaxTypescript from '@babel/plugin-syntax-typescript';
import inulaNext from './plugin';
import { type DLightOption } from './types';
import { type ConfigAPI, type TransformOptions } from '@babel/core';

export default function (_: ConfigAPI, options: DLightOption): TransformOptions {
  return {
    plugins: [
      syntaxJSX.default ?? syntaxJSX,
      [syntaxTypescript.default ?? syntaxTypescript, { isTSX: true }],
      [syntaxDecorators.default ?? syntaxDecorators, { legacy: true }],
      [inulaNext, options],
    ],
  };
}

export { type DLightOption };
