import type babel from '@babel/core';
import type { BabelFile } from '@babel/core';
import { NodePath, type PluginObj, type types as t } from '@babel/core';
import { type InulaNextOption } from './types';
import { defaultAttributeMap, defaultHTMLTags, getAccessedKeys } from './constants';
import { analyze } from './analyze';
import { addImport, extractFnFromMacro, fileAllowed, getMacroType, toArray } from './utils';
import { register } from '@openinula/babel-api';
import { generate } from './generator';
import { ComponentNode, HookNode } from './analyze/types';

const ALREADY_COMPILED: WeakSet<NodePath> | Set<NodePath> = new (WeakSet ?? Set)();

interface PluginState {
  customState: Record<string, ComponentNode>;
  filename: string;
  file: BabelFile;
}


function transformNode(
  path: NodePath<t.CallExpression>,
  htmlTags: string[],
  state: PluginState,
  hoist: (node: t.Statement | t.Statement[]) => void
) {
  console.log('[transformNode] Start processing a CallExpression at line:', path.node.loc?.start.line);
  if (ALREADY_COMPILED.has(path)) {
    console.log('[transformNode] Skipped (already compiled)');
    return false;
  }
  const type = getMacroType(path);
  if (type) {
    console.log(`[transformNode] Found a "${type}" macro.`);
    const componentNode = extractFnFromMacro(path, type);
    let name = '';
    // try to get the component name, when parent is a variable declarator
    if (path.parentPath.isVariableDeclarator()) {
      const lVal = path.parentPath.get('id');
      if (lVal.isIdentifier()) {
        name = lVal.node.name;
      } else {
        console.error(`${type} macro must be assigned to a variable`);
      }
    }
    console.log(`[transformNode] Analyzing component: ${name || 'anonymous'}`);
    const [root, bitManager] = analyze(type, name, componentNode, {
      htmlTags,
    });
    console.log('[transformNode] Analyzed component:', root);
    
    
    const loc = path.node.loc;
    if (!loc) {
      console.warn('No location info for node:', path.node);
      return false;
    }
    const metadata = state.file.metadata as any;
    console.log('[transformNode] Current metadata:', metadata);
    if (!metadata.analysisResults) {
      metadata.analysisResults = [];
    }
        
    console.log('[transformNode] Generating new component code.');
    const resultNode = generate(root, bitManager, hoist);

    recordComponentInState(state, name, root);

    replaceWithComponent(path, resultNode);

    console.log('[transformNode] Finished processing macro.');
    return true;
  }

  console.log('[transformNode] Not an Inula macro, skipping.');
  ALREADY_COMPILED.add(path);
  return false;
}

export default function (api: typeof babel, options: InulaNextOption): PluginObj<PluginState> {
  const {
    files = '**/*.{js,ts,jsx,tsx}',
    excludeFiles = '**/{dist,node_modules,lib}/*',
    packageName = '@openinula/next',
    htmlTags: customHtmlTags = defaultHtmlTags => defaultHtmlTags,
    attributeMap = defaultAttributeMap,
  } = options;

  const htmlTags =
    typeof customHtmlTags === 'function'
      ? customHtmlTags(defaultHTMLTags)
      : customHtmlTags.includes('*')
        ? [...new Set([...defaultHTMLTags, ...customHtmlTags])].filter(tag => tag !== '*')
        : customHtmlTags;

  register(api);
  return {
    name: 'babel-inula-next-core',
    visitor: {
      Program: {
        exit(program, state) {
          if (!fileAllowed(state.filename, toArray(files), toArray(excludeFiles))) {
            program.skip();
            return;
          }
          let transformationHappenedInFile = false;

          const hoistedNodes: t.Statement[] = [];
          const hoist = (node: t.Statement | t.Statement[]) => {
            if (Array.isArray(node)) {
              hoistedNodes.push(...node);
            } else {
              hoistedNodes.push(node);
            }
          };

          program.traverse({
            CallExpression(path) {
              const transformed = transformNode(path, htmlTags, state, hoist);
              if (transformed) {
                path.skip();
              }

              transformationHappenedInFile = transformed || transformationHappenedInFile;
            },
          });

          program.node.body.unshift(...hoistedNodes);

          if (transformationHappenedInFile && !options.skipImport) {
            addImport(program.node, getAccessedKeys(), packageName);
          }
        },
      },
    },
  };
}

function replaceWithComponent(path: NodePath<t.CallExpression>, resultNode: t.FunctionDeclaration) {
  const variableDeclarationPath = path.parentPath.parentPath!;
  const resultNodeId = resultNode.id;
  if (resultNodeId) {
    // if id exist, use a temp name to avoid error of duplicate declaration
    const realFuncName = resultNodeId.name;
    resultNodeId.name = path.scope.generateUid('tmp');
    variableDeclarationPath.replaceWith(resultNode);
    resultNodeId.name = realFuncName;
  } else {
    variableDeclarationPath.replaceWith(resultNode);
  }
}

function recordComponentInState(state: PluginState, name: string, componentNode: ComponentNode | HookNode) {
  const metadata = state.file.metadata as { components: Record<string, ComponentNode | HookNode> };
  if (!metadata.components) {
    metadata.components = {};
  }
  metadata.components[name] = componentNode;
}
