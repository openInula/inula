import type { NodePath, types as t, traverse as tr } from '@babel/core';
import type {
  UnitProp,
  ViewUnit,
  ViewParserConfig,
  AllowedJSXNode,
  HTMLUnit,
  TextUnit,
  MutableUnit,
  TemplateProp,
  Context,
} from './types';

export class ViewParser {
  // ---- Namespace and tag name
  private readonly htmlNamespace: string = 'html';
  private readonly htmlTagNamespace: string = 'tag';
  private readonly compTagNamespace: string = 'comp';
  private readonly envTagName: string = 'env';
  private readonly forTagName: string = 'for';
  private readonly ifTagName: string = 'if';
  private readonly elseIfTagName: string = 'else-if';
  private readonly elseTagName: string = 'else';
  private readonly customHTMLProps: string[] = ['ref'];

  private readonly config: ViewParserConfig;
  private readonly htmlTags: string[];
  private readonly willParseTemplate: boolean;

  private readonly t: typeof t;
  private readonly traverse: typeof tr;

  private readonly viewUnits: ViewUnit[] = [];
  private context: Context;

  /**
   * @brief Constructor
   * @param config
   * @param context
   */
  constructor(config: ViewParserConfig, context: Context = { ifElseStack: [] }) {
    this.config = config;
    this.t = config.babelApi.types;
    this.traverse = config.babelApi.traverse;
    this.htmlTags = config.htmlTags;
    this.willParseTemplate = config.parseTemplate ?? true;
    this.context = context;
  }

  /**
   * @brief Parse the node into view units
   * @param node
   * @returns ViewUnit[]
   */
  parse(node: AllowedJSXNode): ViewUnit[] {
    if (this.t.isJSXText(node)) this.parseText(node);
    else if (this.t.isJSXExpressionContainer(node)) this.parseExpression(node.expression);
    else if (this.t.isJSXElement(node)) this.parseElement(node);
    else if (this.t.isJSXFragment(node)) {
      node.children.forEach(child => {
        this.parse(child);
      });
    }

    return this.viewUnits;
  }

  /**
   * @brief Parse JSXText
   * @param node
   */
  private parseText(node: t.JSXText): void {
    const text = node.value.trim();
    if (!text) return;
    this.viewUnits.push({
      type: 'text',
      content: this.t.stringLiteral(node.value),
    });
  }

  /**
   * @brief Parse JSXExpressionContainer
   * @param node
   */
  private parseExpression(node: t.Expression | t.JSXEmptyExpression): void {
    if (this.t.isJSXEmptyExpression(node)) return;
    if (this.t.isLiteral(node) && !this.t.isTemplateLiteral(node)) {
      // ---- Treat literal as text except template literal
      //      Cuz template literal may have viewProp inside like:
      //      <>{i18n`hello ${<MyView/>}`}</>
      this.viewUnits.push({
        type: 'text',
        content: node,
      });
      return;
    }
    this.viewUnits.push({
      type: 'exp',
      content: this.parseProp(node),
      props: {},
    });
  }

  /**
   * @brief Parse JSXElement
   * @param node
   */
  private parseElement(node: t.JSXElement): void {
    let type: 'html' | 'comp';
    let tag: t.Expression;

    // ---- Parse tag and type
    const openingName = node.openingElement.name;
    if (this.t.isJSXIdentifier(openingName)) {
      // ---- Opening name is a JSXIdentifier, e.g., <div>
      const name = openingName.name;
      // ---- Specially parse if and env
      if ([this.ifTagName, this.elseIfTagName, this.elseTagName].includes(name)) return this.parseIf(node);
      if (name === this.envTagName) return this.parseEnv(node);
      if (name === this.forTagName) return this.pareFor(node);
      else if (this.htmlTags.includes(name)) {
        type = 'html';
        tag = this.t.stringLiteral(name);
      } else {
        // ---- If the name is not in htmlTags, treat it as a comp
        type = 'comp';
        tag = this.t.identifier(name);
      }
    } else if (this.t.isJSXMemberExpression(openingName)) {
      // ---- Opening name is a JSXMemberExpression, e.g., <Comp.Div>
      //      Treat it as a comp and set the tag as the opening name
      type = 'comp';
      // ---- Turn JSXMemberExpression into MemberExpression recursively
      const toMemberExpression = (node: t.JSXMemberExpression): t.MemberExpression => {
        if (this.t.isJSXMemberExpression(node.object)) {
          return this.t.memberExpression(toMemberExpression(node.object), this.t.identifier(node.property.name));
        }
        return this.t.memberExpression(this.t.identifier(node.object.name), this.t.identifier(node.property.name));
      };
      tag = toMemberExpression(openingName);
    } else {
      // ---- isJSXNamespacedName
      const namespace = openingName.namespace.name;
      switch (namespace) {
        case this.compTagNamespace:
          // ---- If the namespace is the same as the compTagNamespace, treat it as a comp
          //      and set the tag as an identifier
          //      e.g., <comp:div/> => ["comp", div]
          //      this means you've declared a component named "div" and force it to be a comp instead an html
          type = 'comp';
          tag = this.t.identifier(openingName.name.name);
          break;
        case this.htmlNamespace:
          // ---- If the namespace is the same as the htmlTagNamespace, treat it as an html
          //      and set the tag as a string literal
          //      e.g., <html:MyWebComponent/> => ["html", "MyWebComponent"]
          //      the tag will be treated as a string, i.e., <MyWebComponent/>
          type = 'html';
          tag = this.t.stringLiteral(openingName.name.name);
          break;
        case this.htmlTagNamespace:
          // ---- If the namespace is the same as the htmlTagNamespace, treat it as an html
          //      and set the tag as an identifier
          //      e.g., <tag:variable/> => ["html", variable]
          //      this unit will be htmlUnit and the html string tag is stored in "variable"
          type = 'html';
          tag = this.t.identifier(openingName.name.name);
          break;
        default:
          // ---- Otherwise, treat it as an html tag and make the tag as the namespace:name
          type = 'html';
          tag = this.t.stringLiteral(`${namespace}:${openingName.name.name}`);
          break;
      }
    }

    // ---- Parse the props
    const props = node.openingElement.attributes;
    const propMap: Record<string, UnitProp> = Object.fromEntries(props.map(prop => this.parseJSXProp(prop)));

    // ---- Parse the children
    const childUnits = node.children.map(child => this.parseView(child)).flat();

    let unit: ViewUnit = { type, tag, props: propMap, children: childUnits };

    if (unit.type === 'html' && childUnits.length === 1 && childUnits[0].type === 'text') {
      // ---- If the html unit only has one text child, merge the text into the html unit
      const text = childUnits[0] as TextUnit;
      unit = {
        ...unit,
        children: [],
        props: {
          ...unit.props,
          textContent: {
            value: text.content,
            viewPropMap: {},
          },
        },
      };
    }

    if (unit.type === 'html') unit = this.transformTemplate(unit);

    this.viewUnits.push(unit);
  }

  /**
   * @brief Parse EnvUnit
   * @param node
   */
  private parseEnv(node: t.JSXElement): void {
    const props = node.openingElement.attributes;
    const propMap: Record<string, UnitProp> = Object.fromEntries(props.map(prop => this.parseJSXProp(prop)));
    const children = node.children.map(child => this.parseView(child)).flat();
    this.viewUnits.push({
      type: 'env',
      props: propMap,
      children,
    });
  }

  private parseIf(node: t.JSXElement): void {
    const name = (node.openingElement.name as t.JSXIdentifier).name;
    // ---- else
    if (name === this.elseTagName) {
      const lastUnit = this.context.ifElseStack[this.context.ifElseStack.length - 1];
      if (!lastUnit || lastUnit.type !== 'if') throw new Error(`Missing if for ${name}`);
      lastUnit.branches.push({
        condition: this.t.booleanLiteral(true),
        children: node.children.map(child => this.parseView(child)).flat(),
      });
      this.context.ifElseStack.pop();
      return;
    }

    const condition = node.openingElement.attributes.filter(
      attr => this.t.isJSXAttribute(attr) && attr.name.name === 'cond'
    )[0];
    if (!condition) throw new Error(`Missing condition for ${name}`);
    if (!this.t.isJSXAttribute(condition)) throw new Error(`JSXSpreadAttribute is not supported for ${name} condition`);
    if (!this.t.isJSXExpressionContainer(condition.value) || !this.t.isExpression(condition.value.expression))
      throw new Error(`Invalid condition for ${name}`);

    // ---- if
    if (name === this.ifTagName) {
      const unit = {
        type: 'if' as const,
        branches: [
          {
            condition: condition.value.expression,
            children: node.children.map(child => this.parseView(child)).flat(),
          },
        ],
      };
      this.viewUnits.push(unit);
      this.context.ifElseStack.push(unit);
      return;
    }

    // ---- else-if
    const lastUnit = this.context.ifElseStack[this.context.ifElseStack.length - 1];
    if (!lastUnit || lastUnit.type !== 'if') throw new Error(`Missing if for ${name}`);

    lastUnit.branches.push({
      condition: condition.value.expression,
      children: node.children.map(child => this.parseView(child)).flat(),
    });
  }

  /**
   * @brief Parse JSXAttribute or JSXSpreadAttribute into UnitProp,
   *  considering both namespace and expression
   * @param prop
   * @returns [propName, propValue]
   */
  private parseJSXProp(prop: t.JSXAttribute | t.JSXSpreadAttribute): [string, UnitProp] {
    if (this.t.isJSXAttribute(prop)) {
      let propName: string, specifier: string | undefined;
      if (this.t.isJSXNamespacedName(prop.name)) {
        // ---- If the prop name is a JSXNamespacedName, e.g., bind:value
        //      give it a special tag
        propName = prop.name.name.name;
        specifier = prop.name.namespace.name;
      } else {
        propName = prop.name.name;
      }
      let value = this.t.isJSXExpressionContainer(prop.value) ? prop.value.expression : prop.value;
      if (this.t.isJSXEmptyExpression(value)) value = undefined;
      return [propName, this.parseProp(value, specifier)];
    }
    // ---- Use *spread* as the propName to avoid conflict with other props
    return ['*spread*', this.parseProp(prop.argument)];
  }

  /**
   * @brief Parse the prop node into UnitProp
   * @param propNode
   * @param specifier
   * @returns UnitProp
   */
  private parseProp(propNode: t.Expression | undefined | null, specifier?: string): UnitProp {
    // ---- If there is no propNode, set the default prop as true
    if (!propNode) {
      return {
        value: this.t.booleanLiteral(true),
        viewPropMap: {},
      };
    }

    // ---- Collect sub jsx nodes as Prop
    const viewPropMap: Record<string, ViewUnit[]> = {};
    const parseViewProp = (innerPath: NodePath<t.JSXElement | t.JSXFragment>): void => {
      const id = this.uid();
      const node = innerPath.node;
      viewPropMap[id] = this.parseView(node);
      const newNode = this.t.stringLiteral(id);
      if (node === propNode) {
        // ---- If the node is the propNode, replace it with the new node
        propNode = newNode;
      }
      // ---- Replace the node and skip the inner path
      innerPath.replaceWith(newNode);
      innerPath.skip();
    };

    // ---- Apply the parseViewProp to JSXElement and JSXFragment
    this.traverse(this.wrapWithFile(propNode), {
      JSXElement: parseViewProp,
      JSXFragment: parseViewProp,
    });

    return {
      value: propNode,
      viewPropMap,
      specifier,
    };
  }

  transformTemplate(unit: ViewUnit): ViewUnit {
    if (!this.willParseTemplate) return unit;
    if (!this.isHTMLTemplate(unit)) return unit;
    unit = unit as HTMLUnit;
    return {
      type: 'template',
      template: this.generateTemplate(unit),
      mutableUnits: this.generateMutableUnits(unit),
      props: this.parseTemplateProps(unit),
    };
  }

  /**
   * @brief Generate the entire HTMLUnit
   * @param unit
   * @returns HTMLUnit
   */
  private generateTemplate(unit: HTMLUnit): HTMLUnit {
    const staticProps = Object.fromEntries(
      this.filterTemplateProps(
        // ---- Get all the static props
        Object.entries(unit.props ?? []).filter(
          ([, prop]) =>
            this.isStaticProp(prop) &&
            // ---- Filter out props with false values
            !(this.t.isBooleanLiteral(prop.value) && !prop.value.value)
        )
      )
    );

    let children: (HTMLUnit | TextUnit)[] = [];
    if (unit.children) {
      children = unit.children
        .map(unit => {
          if (unit.type === 'text') return unit;
          if (unit.type === 'html' && this.t.isStringLiteral(unit.tag)) {
            return this.generateTemplate(unit);
          }
        })
        .filter(Boolean) as (HTMLUnit | TextUnit)[];
    }
    return {
      type: 'html',
      tag: unit.tag,
      props: staticProps,
      children,
    };
  }

  /**
   * @brief Collect all the mutable nodes in a static HTMLUnit
   *  We use this function to collect mutable nodes' path and props,
   *  so that in the generator, we know which position to insert the mutable nodes
   * @param htmlUnit
   * @returns mutable particles
   */
  private generateMutableUnits(htmlUnit: HTMLUnit): MutableUnit[] {
    const mutableUnits: MutableUnit[] = [];

    const generateMutableUnit = (unit: HTMLUnit, path: number[] = []) => {
      const maxHtmlIdx = unit.children?.filter(
        child => (child.type === 'html' && this.t.isStringLiteral(child.tag)) || child.type === 'text'
      ).length;
      let htmlIdx = -1;
      // ---- Generate mutable unit for current HTMLUnit
      unit.children?.forEach(child => {
        if (!(child.type === 'html' && this.t.isStringLiteral(child.tag)) && !(child.type === 'text')) {
          const idx = htmlIdx + 1 >= maxHtmlIdx ? -1 : htmlIdx + 1;
          mutableUnits.push({
            path: [...path, idx],
            ...this.transformTemplate(child),
          });
        } else {
          htmlIdx++;
        }
      });
      // ---- Recursively generate mutable units for static HTMLUnit children
      unit.children
        ?.filter(child => child.type === 'html' && this.t.isStringLiteral(child.tag))
        .forEach((child, idx) => {
          generateMutableUnit(child as HTMLUnit, [...path, idx]);
        });
    };
    generateMutableUnit(htmlUnit);

    return mutableUnits;
  }

  /**
   * @brief Collect all the props in a static HTMLUnit or its nested HTMLUnit children
   *  Just like the mutable nodes, props are also equipped with path,
   *  so that we know which HTML ChildNode to insert the props
   * @param htmlUnit
   * @returns props
   */
  private parseTemplateProps(htmlUnit: HTMLUnit): TemplateProp[] {
    const templateProps: TemplateProp[] = [];
    const generateVariableProp = (unit: HTMLUnit, path: number[]) => {
      // ---- Generate all non-static(string/number/boolean) props for current HTMLUnit
      //      to be inserted further in the generator
      unit.props &&
        Object.entries(unit.props)
          .filter(([, prop]) => !this.isStaticProp(prop))
          .forEach(([key, prop]) => {
            templateProps.push({
              tag: unit.tag,
              name: (unit.tag as t.StringLiteral).value,
              key,
              path,
              value: prop.value,
            });
          });
      // ---- Recursively generate props for static HTMLUnit children
      unit.children
        ?.filter(child => child.type === 'html' && this.t.isStringLiteral(child.tag))
        .forEach((child, idx) => {
          generateVariableProp(child as HTMLUnit, [...path, idx]);
        });
    };
    generateVariableProp(htmlUnit, []);

    return templateProps;
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

  private isStaticProp(prop: UnitProp): boolean {
    return (
      this.t.isStringLiteral(prop.value) ||
      this.t.isNumericLiteral(prop.value) ||
      this.t.isBooleanLiteral(prop.value) ||
      this.t.isNullLiteral(prop.value)
    );
  }

  /**
   * @brief Filter out some props that are not needed in the template,
   *  these are all special props to be parsed differently in the generator
   * @param props
   * @returns filtered props
   */
  private filterTemplateProps<T>(props: Array<[string, T]>): Array<[string, T]> {
    return (
      props
        // ---- Filter out event listeners
        .filter(([key]) => !key.startsWith('on'))
        // ---- Filter out specific props
        .filter(([key]) => !this.customHTMLProps.includes(key))
    );
  }

  /**
   * @brief Parse the view by duplicating current parser's classRootPath, statements and htmlTags
   * @param statements
   * @returns ViewUnit[]
   */
  private parseView(node: AllowedJSXNode): ViewUnit[] {
    return new ViewParser({ ...this.config, parseTemplate: false }, this.context).parse(node);
  }

  /**
   * @brief Wrap the value in a file
   * @param node
   * @returns wrapped value
   */
  private wrapWithFile(node: t.Expression): t.File {
    return this.t.file(this.t.program([this.t.expressionStatement(node)]));
  }

  /**
   * @brief Generate a unique id
   * @returns a unique id
   */
  private uid(): string {
    return Math.random().toString(36).slice(2);
  }

  private findProp(node: t.JSXElement, name: string) {
    const props = node.openingElement.attributes;

    return props.find((prop): prop is t.JSXAttribute => this.t.isJSXAttribute(prop) && prop.name.name === name);
  }

  private pareFor(node: t.JSXElement) {
    // ---- Get array
    const arrayContainer = this.findProp(node, "array")
    if (!arrayContainer) throw new Error("Missing [array] prop in for loop")
    if (!this.t.isJSXExpressionContainer(arrayContainer.value)) throw new Error("Expected expression container for [array] prop")
    const array = arrayContainer.value.expression
    if (this.t.isJSXEmptyExpression(array)) throw new Error("Expected [array] expression not empty")

    // ---- Get key
    const keyProp = this.findProp(node, "key")
    let key: t.Expression = this.t.nullLiteral()
    if (keyProp) {
      if (!(
        this.t.isJSXExpressionContainer(keyProp.value) &&
        this.t.isFunction(keyProp.value.expression)
      )) throw new Error("Expected expression container")
      key = keyProp.value.expression
    }

    // ---- Get Item
    const itemProp = this.findProp(node, "item")
    if (!itemProp) throw new Error("Missing [item] prop in for loop")
    if (!this.t.isJSXExpressionContainer(itemProp.value)) throw new Error("Expected expression container for [item] prop")
    const item = itemProp.value.expression
    if (this.t.isJSXEmptyExpression(item)) throw new Error("Expected [item] expression not empty")
    // ---- ObjectExpression to ObjectPattern / ArrayExpression to ArrayPattern
    this.traverse(this.wrapWithFile(item), {
      ObjectExpression: (path) => {
        path.type = "ObjectPattern" as any
      },
      ArrayExpression: (path) => {
        path.type = "ArrayPattern" as any
      }
    })

    // ---- Get children
    const children = this.t.jsxFragment(this.t.jsxOpeningFragment(), this.t.jsxClosingFragment(), node.children)

    this.viewUnits.push({
      type: "for",
      key,
      item: item as t.LVal,
      array,
      children: this.parseView(children)
    })
  }
}
