import {
  type CompParticle,
  type DependencyProp,
  ReactiveBitMap,
  type ContextParticle,
  type ExpParticle,
  type ForParticle,
  type HTMLParticle,
  type IfParticle,
  type MutableParticle,
  type ReactivityParserConfig,
  type TemplateParticle,
  type TemplateProp,
  type TextParticle,
  type ViewParticle,
  FragmentParticle,
} from './types';
import { type NodePath, type traverse, type types as t } from '@babel/core';
import {
  FragmentUnit,
  SuspenseUnit,
  type CompUnit,
  type ContextUnit,
  type ExpUnit,
  type ForUnit,
  type HTMLUnit,
  type IfUnit,
  type TextUnit,
  type UnitProp,
  type ViewUnit,
} from '@openinula/jsx-view-parser';
import { DLError } from './error';
import { Dependency, genReactiveBitMap, getDependenciesFromNode } from './getDependencies';

export class ReactivityParser {
  private readonly config: ReactivityParserConfig;

  private readonly t: typeof t;
  private readonly traverse: typeof traverse;

  /**
   * The reactive bit map in the specific scope.
   * We utilize bitmaps to detect concurrent read-write operations on reactive variables
   */
  private readonly reactiveBitMap: ReactiveBitMap;
  private readonly reactivityFuncNames;

  private static readonly customHTMLProps = [
    'didUpdate',
    'willMount',
    'didMount',
    'willUnmount',
    'didUnmount',
    'element',
    'innerHTML',
    'props',
    'attrs',
    'dataset',
    'forwardProps',
  ];

  usedReactiveBits = 0;

  addReactiveBits(dependency: Dependency) {
    this.usedReactiveBits |= dependency.depIdBitmap;
  }

  mergeReactiveBits(other: ReactivityParser) {
    this.usedReactiveBits |= other.usedReactiveBits;
  }

  /**
   * @brief Constructor
   * @param config
   */
  constructor(config: ReactivityParserConfig) {
    this.config = config;
    this.t = config.babelApi.types;
    this.traverse = config.babelApi.traverse;
    this.reactiveBitMap = config.reactiveMap;
    this.reactivityFuncNames = config.reactivityFuncNames ?? [];
  }

  /**
   * @brief Parse the ViewUnit into a ViewParticle
   * @returns
   */
  parse(viewUnit: ViewUnit): ViewParticle {
    return this.parseViewUnit(viewUnit);
  }

  /**
   * @brief Parse a ViewUnit into a ViewParticle
   * @param viewUnit
   * @returns ViewParticle
   */
  private parseViewUnit(viewUnit: ViewUnit): ViewParticle {
    if (this.isHTMLTemplate(viewUnit)) return this.parseTemplate(viewUnit as HTMLUnit);
    if (viewUnit.type === 'text') return this.parseText(viewUnit);
    if (viewUnit.type === 'html') return this.parseHTML(viewUnit);
    if (viewUnit.type === 'comp') return this.parseComp(viewUnit);
    if (viewUnit.type === 'for') return this.parseFor(viewUnit);
    if (viewUnit.type === 'if') return this.parseIf(viewUnit);
    if (viewUnit.type === 'context') return this.parseContext(viewUnit);
    if (viewUnit.type === 'exp') return this.parseExp(viewUnit);
    if (viewUnit.type === 'fragment') return this.parseFragment(viewUnit);
    if (viewUnit.type === 'suspense') return this.parseSuspense(viewUnit);
    return DLError.throw1();
  }

  // ---- Parsers ----
  // ---- @Template ----
  /**
   * @brief Collect static HTMLUnit into a template particle and generate a template string
   *  MutableParticle means whatever unit that is not a static HTMLUnit or a TextUnit
   *  Props means all the non-static props of the nested HTMLUnit or TextUnit, e.g. div().className(this.name)
   * @param htmlUnit
   * @returns TemplateParticle
   */
  private parseTemplate(htmlUnit: HTMLUnit): TemplateParticle {
    return {
      type: 'template',
      template: this.generateTemplate(htmlUnit),
      props: this.parseTemplateProps(htmlUnit),
      mutableParticles: this.generateMutableParticles(htmlUnit),
    };
  }

  private parseFragment(fragmentUnit: FragmentUnit): FragmentParticle {
    return {
      type: 'fragment',
      children: fragmentUnit.children.map(this.parseViewParticle.bind(this)),
    };
  }

  /**
   * @brief Generate a template
   *  There'll be a situation where the tag is dynamic, e.g. tag(this.htmlTag),
   *  which we can't generate a template string for it, so we'll wrap it in an ExpParticle in parseHTML() section
   * @returns template string
   * @param unit
   */
  private generateTemplate(unit: HTMLUnit): HTMLParticle {
    const staticProps = this.filterTemplateProps(
      // ---- Get all the static props
      Object.entries(unit.props).filter(
        ([, prop]) =>
          this.isStaticProp(prop) &&
          // ---- Filter out props with false values
          !(this.t.isBooleanLiteral(prop.value) && !prop.value.value)
      )
    ).map(([key, prop]) => [
      key,
      {
        ...prop,
        depMask: 0,
        allDepBits: [],
        dependenciesNode: this.t.arrayExpression([]),
      },
    ]);

    let children: ViewParticle[] = [];
    if (!unit.props.textContent) {
      children = unit.children
        .map(unit => {
          if (unit.type === 'html' && this.t.isStringLiteral(unit.tag)) {
            return this.generateTemplate(unit);
          }
          if (unit.type === 'text' && this.t.isStringLiteral(unit.content)) {
            return this.parseText(unit);
          }
        })
        .filter(Boolean) as HTMLParticle[];
    }
    return {
      type: 'html',
      tag: unit.tag,
      props: Object.fromEntries(staticProps),
      children,
    };
  }

  /**
   * @brief Collect all the mutable nodes in a static HTMLUnit
   *  We use this function to collect mutable nodes' path and props,
   *  so that in the generate, we know which position to insert the mutable nodes
   * @param htmlUnit
   * @returns mutable particles
   */
  private generateMutableParticles(htmlUnit: HTMLUnit): MutableParticle[] {
    const mutableParticles: MutableParticle[] = [];
    const generateMutableUnit = (unit: HTMLUnit, path: number[] = []) => {
      // ---- Generate mutable particles for current HTMLUnit
      unit.children?.forEach((child, idx) => {
        if (
          !(child.type === 'html' && this.t.isStringLiteral(child.tag)) &&
          !(child.type === 'text' && this.t.isStringLiteral(child.content))
        ) {
          mutableParticles.push({
            path: [...path, idx],
            ...this.parseViewParticle(child),
          });
        }
      });
      // ---- Recursively generate mutable particles for static HTMLUnit children
      unit.children
        ?.filter(
          child =>
            (child.type === 'html' && this.t.isStringLiteral(child.tag)) ||
            (child.type === 'text' && this.t.isStringLiteral(child.content))
        )
        .forEach((child, idx) => {
          if (child.type === 'html') {
            generateMutableUnit(child as HTMLUnit, [...path, idx]);
          }
        });
    };
    generateMutableUnit(htmlUnit);

    return mutableParticles;
  }

  /**
   * @brief Collect all the props in a static HTMLUnit or its nested HTMLUnit or TextUnit children
   *  Just like the mutable nodes, props are also equipped with path,
   *  so that we know which HTML ChildNode to insert the props
   * @param htmlUnit
   * @returns props
   */
  private parseTemplateProps(htmlUnit: HTMLUnit): TemplateProp[] {
    const templateProps: TemplateProp[] = [];
    const generateVariableProp = (unit: HTMLUnit, path: number[]) => {
      // ---- Generate all non-static(string/number/boolean) props for current HTMLUnit
      //      to be inserted further in the generate
      Object.entries(unit.props)
        .filter(([, prop]) => !this.isStaticProp(prop))
        .forEach(([key, prop]) => {
          templateProps.push({
            tag: (unit.tag as t.StringLiteral).value,
            key,
            path,
            value: prop.value,
            ...this.getDependencies(prop.value),
          });
        });
      // ---- Recursively generate props for static HTMLUnit children
      unit.children
        .filter(
          child =>
            (child.type === 'html' && this.t.isStringLiteral(child.tag)) ||
            (child.type === 'text' && this.t.isStringLiteral(child.content))
        )
        .forEach((child, idx) => {
          if (child.type === 'html') {
            generateVariableProp(child, [...path, idx]);
          } else if (child.type === 'text') {
            // ---- if the child is a TextUnit, we just insert the text content
            templateProps.push({
              tag: 'text',
              key: 'value',
              path: [...path, idx],
              value: child.content,
              dependenciesNode: this.t.arrayExpression([]),
              depIdBitmap: 0,
            });
          }
        });
    };
    generateVariableProp(htmlUnit, []);

    return templateProps;
  }

  // ---- @Text ----
  /**
   * @brief Parse a TextUnit into a TextParticle.
   *  This is only for a top level TextUnit, because if nested in HTMLUnit, it'll be parsed in the template string
   * @param textUnit
   * @returns TextParticle
   */
  private parseText(textUnit: TextUnit): TextParticle {
    return {
      type: 'text',
      content: {
        value: textUnit.content,
        ...this.getDependencies(textUnit.content),
      },
    };
  }

  // ---- @HTML ----
  /**
   * @brief Parse an HTMLUnit with a dynamic tag into an ExpParticle or an HTMLParticle
   *  We detect dependencies in the tag, if there's no dependency,
   *  we parse it as an HTMLParticle and dynamically append it to the parent node;
   *  if there's dependency, we parse it as an ExpParticle and wrap it in an ExpParticle
   *  so that we can make the tag reactive
   * @param htmlUnit
   * @returns ExpParticle | HTMLParticle
   */
  private parseHTML(htmlUnit: HTMLUnit): ExpParticle | HTMLParticle {
    const innerHTMLParticle: HTMLParticle = {
      type: 'html',
      tag: htmlUnit.tag,
      props: {},
      children: [],
    };

    innerHTMLParticle.props = Object.fromEntries(
      Object.entries(htmlUnit.props).map(([key, prop]) => [key, this.generateDependencyProp(prop)])
    );

    innerHTMLParticle.children = htmlUnit.children.map(this.parseViewParticle.bind(this));

    // ---- Not a dynamic tag
    return innerHTMLParticle;
  }

  // ---- @Comp ----
  /**
   * @brief Parse a CompUnit into a CompParticle or an ExpParticle
   *  Similar to parseHTML(), we detect dependencies in the tag, if there's no dependency,
   *  we parse it as a regular CompParticle, otherwise we wrap it with an ExpParticle.
   * @param compUnit
   * @returns CompParticle | ExpParticle
   */
  private parseComp(compUnit: CompUnit): CompParticle {
    const compParticle: CompParticle = {
      type: 'comp',
      tag: compUnit.tag,
      props: {},
      children: [],
    };

    compParticle.props = Object.fromEntries(
      Object.entries(compUnit.props).map(([key, prop]) => [key, this.generateDependencyProp(prop)])
    );
    compParticle.children = compUnit.children.map(this.parseViewParticle.bind(this));

    return compParticle;
  }

  // ---- @For ----
  /**
   * @brief Parse a ForUnit into a ForParticle with dependencies
   *  Key and item doesn't need to be reactive, so here we don't collect dependencies for it
   * @param forUnit
   * @returns ForParticle
   */
  private parseFor(forUnit: ForUnit): ForParticle {
    const { dependenciesNode, depIdBitmap } = this.getDependencies(forUnit.array);
    const prevMap = this.config.reactiveMap;
    const prevDerivedMap = this.config.derivedMap ?? new Map();
    // ---- Generate an identifierDepMap to track identifiers in item and make them reactive
    //      based on the dependencies from the array
    // Just wrap the item in an assignment expression to get all the identifiers
    const itemWrapper = this.t.assignmentExpression('=', forUnit.item, this.t.objectExpression([]));
    const arrayReactBits = depIdBitmap;
    this.config.reactiveMap = new Map([
      ...this.config.reactiveMap,
      ...this.getIdentifiers(itemWrapper).map(id => [id, arrayReactBits] as const),
    ]);

    const forParticle: ForParticle = {
      type: 'for',
      item: forUnit.item,
      index: forUnit.index,
      array: {
        value: forUnit.array,
        dependenciesNode,
        depIdBitmap,
      },
      children: forUnit.children.map(this.parseViewParticle.bind(this)),
      key: forUnit.key,
    };
    this.config.reactiveMap = prevMap;
    this.config.derivedMap = prevDerivedMap;
    return forParticle;
  }

  // ---- @If ----
  /**
   * @brief Parse an IfUnit into an IfParticle with dependencies
   * @param ifUnit
   * @returns IfParticle
   */
  private parseIf(ifUnit: IfUnit): IfParticle {
    return {
      type: 'if',
      branches: ifUnit.branches.map(branch => ({
        condition: {
          value: branch.condition,
          ...this.getDependencies(branch.condition),
        },
        children: branch.children.map(this.parseViewParticle.bind(this)),
      })),
    };
  }

  // ---- @Context ----
  /**
   * @brief Parse an ContextUnit into an ContextParticle with dependencies
   * @param contextProviderUnit
   * @returns ContextParticle
   */
  private parseContext(contextProviderUnit: ContextUnit): ContextParticle {
    return {
      type: 'context',
      contextName: contextProviderUnit.contextName,
      props: Object.fromEntries(
        Object.entries(contextProviderUnit.props).map(([key, prop]) => [key, this.generateDependencyProp(prop)])
      ),
      children: contextProviderUnit.children.map(this.parseViewParticle.bind(this)),
    };
  }

  parseSuspense(viewUnit: SuspenseUnit): ViewParticle {
    return {
      type: 'suspense',
      children: viewUnit.children.map(this.parseViewParticle.bind(this)),
      fallback: viewUnit.fallback,
    };
  }

  // ---- @Exp ----
  /**
   * @brief Parse an ExpUnit into an ExpParticle with dependencies
   * @param expUnit
   * @returns ExpParticle
   */
  private parseExp(expUnit: ExpUnit): ExpParticle {
    return {
      type: 'exp',
      content: this.generateDependencyProp(expUnit.content),
    };
  }

  // ---- Dependencies ----
  /**
   * @brief Generate a dependency prop with dependencies
   * @param prop
   * @returns DependencyProp
   */
  private generateDependencyProp(prop: UnitProp): DependencyProp {
    return {
      value: prop.value,
      ...this.getDependencies(prop.value),
      viewPropMap: Object.fromEntries(
        Object.entries(prop.viewPropMap).map(([key, units]) => [key, units.map(this.parseViewParticle.bind(this))])
      ),
    };
  }

  /**
   * Get all the dependencies of a node
   * @param node
   * @returns Dependency | null
   */
  private getDependencies(node: t.Expression | t.Statement): Dependency {
    const emptyDependency: Dependency = {
      depIdBitmap: 0,
      dependenciesNode: this.t.arrayExpression([]),
    };
    if (this.t.isFunctionExpression(node) || this.t.isArrowFunctionExpression(node)) {
      return emptyDependency;
    }
    const dependency = getDependenciesFromNode(node, this.reactiveBitMap, this.reactivityFuncNames);
    if (dependency) {
      this.addReactiveBits(dependency);
      return dependency;
    }

    return emptyDependency;
  }

  // ---- Utils ----
  /**
   * @brief Parse a ViewUnit into a ViewParticle by new-ing a ReactivityParser
   * @param viewUnit
   * @returns ViewParticle
   */
  private parseViewParticle(viewUnit: ViewUnit): ViewParticle {
    const parser = new ReactivityParser(this.config);
    const parsedUnit = parser.parse(viewUnit);
    this.mergeReactiveBits(parser);
    return parsedUnit;
  }

  /**
   * @brief Check if a ViewUnit is a static HTMLUnit that can be parsed into a template
   *  Must satisfy:
   *  1. type is html
   *  2. tag is a string literal, i.e., non-dynamic tag
   *  3. has at least one child that is a static HTMLUnit,
   *     or else just call a createElement function, no need for template clone
   * @param viewUnit
   * @returns is a static HTMLUnit
   */
  private isHTMLTemplate(viewUnit: ViewUnit): boolean {
    return (
      viewUnit.type === 'html' &&
      this.t.isStringLiteral(viewUnit.tag) &&
      !!viewUnit.children?.some(child => child.type === 'html' && this.t.isStringLiteral(child.tag))
    );
  }

  /**
   * @brief Check if a prop is a static prop
   *  i.e.
   *  1. no viewPropMap
   *  2. value is a string/number/boolean literal
   * @param prop
   * @returns is a static prop
   */
  private isStaticProp(prop: UnitProp): boolean {
    const { value, viewPropMap } = prop;
    return (
      (!viewPropMap || Object.keys(viewPropMap).length === 0) &&
      (this.t.isStringLiteral(value) || this.t.isNumericLiteral(value) || this.t.isBooleanLiteral(value))
    );
  }

  /**
   * @brief Filter out some props that are not needed in the template,
   *  these are all special props to be parsed differently in the generate
   * @param props
   * @returns filtered props
   */
  private filterTemplateProps<T>(props: Array<[string, T]>): Array<[string, T]> {
    return (
      props
        // ---- Filter out event listeners
        .filter(([key]) => !key.startsWith('on'))
        // ---- Filter out specific props
        .filter(([key]) => !ReactivityParser.customHTMLProps.includes(key))
    );
  }

  /**
   * @brief Wrap the value in a file
   * @param node
   * @returns wrapped value
   */
  private valueWrapper(node: t.Expression | t.Statement): t.File {
    return this.t.file(this.t.program([this.t.isStatement(node) ? node : this.t.expressionStatement(node)]));
  }

  /**
   * @brief Check if an identifier is a simple stand alone identifier,
   *  i.e., not a member expression, nor a function param
   * @param path
   *  1. not a member expression
   *  2. not a function param
   *  3. not in a declaration
   *  4. not as object property's not computed key
   * @returns is a stand alone identifier
   */
  private isStandAloneIdentifier(path: NodePath<t.Identifier>): boolean {
    const node = path.node;
    const parentNode = path.parentPath?.node;
    const isMemberExpression = this.t.isMemberExpression(parentNode) && parentNode.property === node;
    if (isMemberExpression) return false;
    const isFunctionParam = this.isAttrFromFunction(path, node.name);
    if (isFunctionParam) return false;
    while (path.parentPath) {
      if (this.t.isVariableDeclarator(path.parentPath.node)) return false;
      if (
        this.t.isObjectProperty(path.parentPath.node) &&
        path.parentPath.node.key === path.node &&
        !path.parentPath.node.computed
      )
        return false;
      path = path.parentPath as NodePath<t.Identifier>;
    }
    return true;
  }

  /**
   * @brief Get all identifiers as strings in a node
   * @param node
   * @returns identifiers
   */
  private getIdentifiers(node: t.Node): string[] {
    if (this.t.isIdentifier(node)) return [node.name];
    const identifierKeys = new Set<string>();
    this.traverse(this.valueWrapper(node as t.Expression), {
      Identifier: innerPath => {
        if (!this.isStandAloneIdentifier(innerPath)) return;
        identifierKeys.add(innerPath.node.name);
      },
    });
    return [...identifierKeys];
  }

  /**
   * @brief check if the identifier is from a function param till the stopNode
   *  e.g:
   *  function myFunc1(ok) { // stopNode = functionBody
   *     const myFunc2 = ok => ok // from function param
   *     console.log(ok) // not from function param
   *  }
   */
  private isAttrFromFunction(path: NodePath, idName: string) {
    let reversePath = path.parentPath;

    const checkParam: (param: t.Node) => boolean = (param: t.Node) => {
      // ---- 3 general types:
      //      * represent allow nesting
      // ---0 Identifier: (a)
      // ---1 RestElement: (...a)   *
      // ---1 Pattern: 3 sub Pattern
      // -----0   AssignmentPattern: (a=1)   *
      // -----1   ArrayPattern: ([a, b])   *
      // -----2   ObjectPattern: ({a, b})
      if (this.t.isIdentifier(param)) return param.name === idName;
      if (this.t.isAssignmentPattern(param)) return checkParam(param.left);
      if (this.t.isArrayPattern(param)) {
        return param.elements
          .filter(Boolean)
          .map(el => checkParam(el!))
          .includes(true);
      }
      if (this.t.isObjectPattern(param)) {
        return (
          param.properties.filter(
            prop => this.t.isObjectProperty(prop) && this.t.isIdentifier(prop.key)
          ) as t.ObjectProperty[]
        )
          .map(prop => (prop.key as t.Identifier).name)
          .includes(idName);
      }
      if (this.t.isRestElement(param)) return checkParam(param.argument);

      return false;
    };

    while (reversePath) {
      const node = reversePath.node;
      if (this.t.isArrowFunctionExpression(node) || this.t.isFunctionDeclaration(node)) {
        for (const param of node.params) {
          if (checkParam(param)) return true;
        }
      }
      reversePath = reversePath.parentPath;
    }

    return false;
  }
}
