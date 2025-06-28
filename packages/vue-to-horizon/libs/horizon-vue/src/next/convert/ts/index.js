import * as ts from 'typescript';

function tsCompile(source, options = null) {
  // Default options -- you could also perform a merge, or use the project tsconfig.json
  if (null === options) {
    options = {
      compilerOptions: {
        target: 'es6',
        module: 'es6',
        preserveValueImports: true,
      },
    };
  }

  return ts.default.transpileModule(source, options).outputText;
}

export default tsCompile;
