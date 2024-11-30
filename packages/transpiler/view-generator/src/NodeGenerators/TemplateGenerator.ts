import { Bitmap, type HTMLParticle, type TemplateParticle } from '@openinula/reactivity-parser';
import HTMLPropGenerator from '../HelperGenerators/HTMLPropGenerator';
import { ViewGenerator, ViewContext } from '../../index';
import { types as t } from '@openInula/babel-api';
import { prefixMap } from '../HelperGenerators/BaseGenerator';

export function run(viewParticle: TemplateParticle, generator: HTMLPropGenerator) {
  const { template, mutableParticles, props } = viewParticle;

  const nodeName = generator.generateNodeName();
  // ---- Add template declaration to class
  const templateName = genTemplate(template, generator);
  // ---- Declare template node in View body
  generator.addInitStatement(declareTemplateNode(nodeName, templateName, generator));

  // ---- Insert elements first
  const paths: number[][] = [];
  props.forEach(({ path }) => {
    paths.push(path);
  });
  mutableParticles.forEach(({ path }) => {
    paths.push(path.slice(0, -1));
  });
  const [insertElementStatements, pathNameMap] = insertElements(paths, nodeName, generator);
  generator.addInitStatement(...insertElementStatements);

  // ---- Resolve props
  const didUpdateMap: Record<string, { depMask: Bitmap; value?: t.Expression }> = {};
  props.forEach(({ tag, path, key, value, depMask, dependenciesNode }) => {
    const name = pathNameMap[path.join('.')];
    if (!didUpdateMap[name])
      didUpdateMap[name] = {
        depMask: 0,
      };
    if (key === 'didUpdate') {
      didUpdateMap[name].value = value;
      return;
    }

    didUpdateMap[name].depMask |= depMask ?? 0;

    generator.addInitStatement(generator.addHTMLProp(name, tag, key, value, depMask, dependenciesNode));
  });

  Object.entries(didUpdateMap).forEach(([name, { depMask, value }]) => {
    if (!value) return;
    generator.addUpdateStatements(depMask, generator.addOnUpdate(name, value));
  });

  // ---- Resolve mutable particles
  mutableParticles.forEach(particle => {
    const path = particle.path;
    // ---- Find parent htmlElement
    const parentName = pathNameMap[path.slice(0, -1).join('.')];
    const [initStatements, childName] = generator.generateChild(particle);
    generator.addInitStatement(...initStatements);
    generator.addInitStatement(generator.insertNode(parentName, childName, path[path.length - 1]));
  });

  return nodeName;
}

function generateTemplateName(templateIdx: number): string {
  return `${prefixMap.template}${templateIdx}`;
}
/**
 * @View
 * const ${templateName} = (() => {
 *   let _$node0, _$node1, ...
 *   ${template}
 *
 *  return _$node0
 * })()
 */
function genTemplate(ctx: ViewContext, template: HTMLParticle, generator: HTMLPropGenerator): string {
  const templateName = generateTemplateName(ctx.getNextTemplateIdx());
  const [statements, nodeName, , nodeIdx] = generator.generateChild(template, false, true);
  ctx.addTemplate(
    templateName,
    t.callExpression(
      t.arrowFunctionExpression(
        [],
        t.blockStatement([...generator.declareNodes(nodeIdx), ...statements, t.returnStatement(t.identifier(nodeName))])
      ),
      []
    )
  );

  return templateName;
}

/**
 * @View
 * ${nodeName} = ${templateName}.cloneNode(true)
 */
function declareTemplateNode(nodeName: string, templateName: string, generator: HTMLPropGenerator): t.Statement {
  return generator.t.expressionStatement(
    generator.t.assignmentExpression(
      '=',
      generator.t.identifier(nodeName),
      generator.t.callExpression(
        generator.t.memberExpression(generator.t.identifier(templateName), generator.t.identifier('cloneNode')),
        [generator.t.booleanLiteral(true)]
      )
    )
  );
}

/**
 * @View
 * ${nodeName}.firstChild
 *  or
 * ${nodeName}.firstChild.nextSibling
 *  or
 * ...
 * ${nodeName}.childNodes[${num}]
 */
function insertElement(nodeName: string, path: number[], offset: number, generator: HTMLPropGenerator): t.Statement {
  const newNodeName = generator.generateNodeName();
  if (path.length === 0) {
    return generator.t.expressionStatement(
      generator.t.assignmentExpression(
        '=',
        generator.t.identifier(newNodeName),
        Array.from<t.Expression>({ length: offset }).reduce((acc: t.Expression) => {
          return generator.t.memberExpression(acc as t.Expression, generator.t.identifier('nextSibling'));
        }, generator.t.identifier(nodeName))
      )
    );
  }
  const addFirstChild = (object: t.Expression) =>
    // ---- ${object}.firstChild
    generator.t.memberExpression(object, generator.t.identifier('firstChild'));
  const addSecondChild = (object: t.Expression) =>
    // ---- ${object}.firstChild.nextSibling
    generator.t.memberExpression(addFirstChild(object), generator.t.identifier('nextSibling'));
  const addThirdChild = (object: t.Expression) =>
    // ---- ${object}.firstChild.nextSibling.nextSibling
    generator.t.memberExpression(addSecondChild(object), generator.t.identifier('nextSibling'));
  const addOtherChild = (object: t.Expression, num: number) =>
    // ---- ${object}.childNodes[${num}]
    generator.t.memberExpression(
      generator.t.memberExpression(object, generator.t.identifier('childNodes')),
      generator.t.numericLiteral(num),
      true
    );
  const addNextSibling = (object: t.Expression) =>
    // ---- ${object}.nextSibling
    generator.t.memberExpression(object, generator.t.identifier('nextSibling'));
  return generator.t.expressionStatement(
    generator.t.assignmentExpression(
      '=',
      generator.t.identifier(newNodeName),
      path.reduce((acc: t.Expression, cur: number, idx) => {
        if (idx === 0 && offset > 0) {
          for (let i = 0; i < offset; i++) acc = addNextSibling(acc);
        }
        if (cur === 0) return addFirstChild(acc);
        if (cur === 1) return addSecondChild(acc);
        if (cur === 2) return addThirdChild(acc);
        return addOtherChild(acc, cur);
      }, generator.t.identifier(nodeName))
    )
  );
}

/**
 * @brief Insert elements to the template node from the paths
 * @param paths
 * @param nodeName
 * @returns
 */
function insertElements(
  paths: number[][],
  nodeName: string,
  generator: HTMLPropGenerator
): [t.Statement[], Record<string, string>] {
  const [statements, collect] = HTMLPropGenerator.statementsCollector();
  const nameMap: Record<string, number[]> = { [nodeName]: [] };

  const commonPrefixPaths = pathWithCommonPrefix(paths);

  commonPrefixPaths.forEach(path => {
    const res = findBestNodeAndPath(nameMap, path, nodeName);
    const [, pat, offset] = res;
    let name = res[0];

    if (pat.length !== 0 || offset !== 0) {
      collect(insertElement(name, pat, offset, generator));
      name = generator.generateNodeName(generator.nodeIdx);
      nameMap[name] = path;
    }
  });
  const pathNameMap = Object.fromEntries(Object.entries(nameMap).map(([name, path]) => [path.join('.'), name]));

  return [statements, pathNameMap];
}

// ---- Path related
/**
 * @brief Extract common prefix from paths
 *  e.g.
 *    [0, 1, 2, 3] + [0, 1, 2, 4] => [0, 1, 2], [0, 1, 2, 3], [0, 1, 2, 4]
 *  [0, 1, 2] is the common prefix
 * @param paths
 * @returns paths with common prefix
 */
function pathWithCommonPrefix(paths: number[][]): number[][] {
  const allPaths = [...paths];
  paths.forEach(path0 => {
    paths.forEach(path1 => {
      if (path0 === path1) return;
      for (let i = 0; i < path0.length; i++) {
        if (path0[i] !== path1[i]) {
          if (i !== 0) {
            allPaths.push(path0.slice(0, i));
          }
          break;
        }
      }
    });
  });

  // ---- Sort by length and then by first element, small to large
  const sortedPaths = allPaths.sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a[0] - b[0];
  });

  // ---- Deduplicate
  const deduplicatedPaths = [...new Set(sortedPaths.map(path => path.join('.')))].map(path =>
    path.split('.').filter(Boolean).map(Number)
  );

  return deduplicatedPaths;
}

/**
 * @brief Find the best node name and path for the given path by looking into the nameMap.
 *  If there's a full match, return the name and an empty path
 *  If there's a partly match, return the name and the remaining path
 *  If there's a nextSibling match, return the name and the remaining path with sibling offset
 * @param nameMap
 * @param path
 * @param defaultName
 * @returns [name, path, siblingOffset]
 */
function findBestNodeAndPath(
  nameMap: Record<string, number[]>,
  path: number[],
  defaultName: string
): [string, number[], number] {
  let bestMatchCount = 0;
  let bestMatchName: string | undefined;
  let bestHalfMatch: [string, number, number] | undefined;
  Object.entries(nameMap).forEach(([name, pat]) => {
    let matchCount = 0;
    const pathLength = pat.length;
    for (let i = 0; i < pathLength; i++) {
      if (pat[i] === path[i]) matchCount++;
    }
    if (matchCount === pathLength - 1) {
      const offset = path[pathLength - 1] - pat[pathLength - 1];
      if (offset > 0 && offset <= 3) {
        bestHalfMatch = [name, matchCount, offset];
      }
    }
    if (matchCount !== pat.length) return;
    if (matchCount > bestMatchCount) {
      bestMatchName = name;
      bestMatchCount = matchCount;
    }
  });
  if (!bestMatchName) {
    if (bestHalfMatch) {
      return [bestHalfMatch[0], path.slice(bestHalfMatch[1] + 1), bestHalfMatch[2]];
    }
    return [defaultName, path, 0];
  }
  return [bestMatchName, path.slice(bestMatchCount), 0];
}

/**
 * TemplateGenerator
 * create template node with mutable particles and props
 * template:
 *
 * const TEMPLATE = createTemplate(`<div><span></span></div>`)
 * createTemplateNode(
 *   TEMPLATE,                    // First param: template definition
 *   node => {                   // Second param: update function for node
 *     const node0 = templateGetElement(node, 0)
 *     return () => {
 *       setHTMLProp(node0, 'className', 'active')
 *     }
 *   },
 *   [0, createCompNode(Button({ id: 'run', text: 'Create 1,000 rows', fn: run }), null), 0, 0],      // Third+ params: Dynamic nodes info [index, node, path...]
 *   [1, createCompNode(Button({ id: 'runlots', text: 'Create 1,000 rows', fn: run }), null), 0, 0]     // Format: [index, node, ...path]
 * )
 */
export const templateGenerator: ViewGenerator = {
  template: ({ template }: TemplateParticle, ctx: ViewContext) => {
    const templateName = genTemplate(template, ctx);
  },
};
