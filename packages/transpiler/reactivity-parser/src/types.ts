import { type types as t } from '@babel/core';
import type Babel from '@babel/core';

export interface DependencyValue<T> {
  value: T;
  depMask?: number; // -> bit
  _depBitmaps: number[];
  dependenciesNode: t.ArrayExpression;
}

export interface DependencyProp {
  value: t.Expression;
  viewPropMap: Record<string, ViewParticle[]>;
  depMask?: number;
  _depBitmaps: number[];
  dependenciesNode: t.ArrayExpression;
}

export interface TemplateProp {
  tag: string;
  key: string;
  path: number[];
  value: t.Expression;
  depMask?: number;
  _depBitmaps: number[];
  dependenciesNode: t.ArrayExpression;
}

export type MutableParticle = ViewParticle & { path: number[] };

export interface TemplateParticle {
  type: 'template';
  template: HTMLParticle;
  mutableParticles: MutableParticle[];
  props: TemplateProp[];
}

export interface TextParticle {
  type: 'text';
  content: DependencyValue<t.Expression>;
}

export interface HTMLParticle {
  type: 'html';
  tag: t.Expression;
  props: Record<string, DependencyValue<t.Expression>>;
  children: ViewParticle[];
}

export interface CompParticle {
  type: 'comp';
  tag: t.Expression;
  props: Record<string, DependencyProp>;
  children: ViewParticle[];
}

export interface ForParticle {
  type: 'for';
  item: t.LVal;
  index: t.Identifier | null;
  array: DependencyValue<t.Expression>;
  key: t.Expression;
  children: ViewParticle[];
}

export interface IfBranch {
  condition: DependencyValue<t.Expression>;
  children: ViewParticle[];
}

export interface IfParticle {
  type: 'if';
  branches: IfBranch[];
}

export interface ContextParticle {
  type: 'context';
  props: Record<string, DependencyProp>;
  children: ViewParticle[];
  contextName: string;
}

export interface ExpParticle {
  type: 'exp';
  content: DependencyProp;
}

export type ViewParticle =
  | TemplateParticle
  | TextParticle
  | HTMLParticle
  | CompParticle
  | ForParticle
  | IfParticle
  | ContextParticle
  | ExpParticle;

export interface ReactivityParserConfig {
  babelApi: typeof Babel;
  depMaskMap: DepMaskMap;
  identifierDepMap?: Record<string, Bitmap>;
  dependencyParseType?: 'property' | 'identifier';
  parseTemplate?: boolean;
  reactivityFuncNames?: string[];
}

// TODO: unify with the types in babel-inula-next-core
export type Bitmap = number;
export type DepMaskMap = Map<string, Bitmap | Bitmap[]>;
