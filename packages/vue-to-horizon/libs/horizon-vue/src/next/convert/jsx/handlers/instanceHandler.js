import { globalLibPaths } from '../../defaultConfig.js';
import t from '@babel/types';
import { INSTANCE, USE_INSTANCE } from '../consts.js';

// Add useInstance import and declaration if not already added
export function addInstance(reactCovert) {
  reactCovert.sourceCodeContext.addExtrasImport(USE_INSTANCE, globalLibPaths.vue);
  reactCovert.addCodeAstToHorizonForOnce(USE_INSTANCE, () => {
    return t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier(INSTANCE), t.callExpression(t.identifier(USE_INSTANCE), [])),
    ]);
  });
}

// 用于生产： const { a, b } = useGlobalProperties();
export function addUsedGlobalProperties(reactCovert, name) {
  if (!reactCovert.sourceCodeContext.usedGlobalProperties.includes(name)) {
    reactCovert.sourceCodeContext.addUsedGlobalProperties(name);
  }
}
