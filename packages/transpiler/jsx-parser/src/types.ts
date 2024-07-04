import type Babel from '@babel/core';
import type { types as t } from '@babel/core';

export interface Context {
  ifElseStack: IfUnit[];
}
export interface UnitProp {
  value: t.Expression;
  viewPropMap: Record<string, ViewUnit[]>;
  specifier?: string;
}

export interface TextUnit {
  type: 'text';
  content: t.Literal;
}

export type MutableUnit = ViewUnit & { path: number[] };

export interface TemplateProp {
  tag: t.Expression;
  name: string;
  key: string;
  path: number[];
  value: t.Expression;
}

export interface TemplateUnit {
  type: 'template';
  template: HTMLUnit;
  mutableUnits: MutableUnit[];
  props: TemplateProp[];
}

export interface HTMLUnit {
  type: 'html';
  tag: t.Expression;
  props: Record<string, UnitProp>;
  children: ViewUnit[];
}

export interface CompUnit {
  type: 'comp';
  tag: t.Expression;
  props: Record<string, UnitProp>;
  children: ViewUnit[];
}

export interface IfBranch {
  condition: t.Expression;
  children: ViewUnit[];
}

export interface IfUnit {
  type: 'if';
  branches: IfBranch[];
}

export interface ExpUnit {
  type: 'exp';
  content: UnitProp;
  props: Record<string, UnitProp>;
}

export interface ContextUnit {
  type: 'context';
  props: Record<string, UnitProp>;
  children: ViewUnit[];
  contextName: string;
}

export interface ForUnit {
  type: 'for';
  item: t.LVal;
  array: t.Expression;
  key: t.Expression;
  index: t.Identifier | null;
  children: ViewUnit[];
}
export type ViewUnit = TextUnit | HTMLUnit | CompUnit | IfUnit | ExpUnit | ContextUnit | TemplateUnit | ForUnit;

export interface ViewParserConfig {
  babelApi: typeof Babel;
  htmlTags: string[];
  parseTemplate?: boolean;
}

export type AllowedJSXNode = t.JSXElement | t.JSXFragment | t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild;
