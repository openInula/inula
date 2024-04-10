import syntaxDecorators from '@babel/plugin-syntax-decorators';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import syntaxTypescript from '@babel/plugin-syntax-typescript';
import dlight from './plugin';
import { type DLightOption } from './types';
import { type ConfigAPI, type TransformOptions } from '@babel/core';
import { plugin as fn2Class } from '@openinula/class-transformer';

export default function (_: ConfigAPI, options: DLightOption): TransformOptions {
  return {
    plugins: [
      syntaxJSX.default ?? syntaxJSX,
      [syntaxTypescript.default ?? syntaxTypescript, { isTSX: true }],
      [syntaxDecorators.default ?? syntaxDecorators, { legacy: true }],
      fn2Class,
      [dlight, options],
    ],
  };
}

export { type DLightOption };
