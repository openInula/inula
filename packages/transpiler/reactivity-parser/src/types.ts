import { type types as t } from '@babel/core';
import type Babel from '@babel/core';

export interface DependencyValue<T> {
  value: T;
  dynamic: boolean; // to removed
  depMask: number; // -> bit
  dependenciesNode: t.ArrayExpression;
}

export interface DependencyProp {
  value: t.Expression;
  viewPropMap: Record<string, ViewParticle[]>;
  depMask: number;
  dependenciesNode: t.ArrayExpression;
}

export interface TemplateProp {
  tag: string;
  key: string;
  path: number[];
  value: t.Expression;
  dynamic: boolean;
  depMask: number;
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

export interface SwitchBranch {
  case: DependencyValue<t.Expression>;
  children: ViewParticle[];
  break: boolean;
}

export interface SwitchParticle {
  type: 'switch';
  discriminant: DependencyValue<t.Expression>;
  branches: SwitchBranch[];
}

export interface TryParticle {
  type: 'try';
  children: ViewParticle[];
  exception: t.Identifier | t.ArrayPattern | t.ObjectPattern | null;
  catchChildren: ViewParticle[];
}

export interface EnvParticle {
  type: 'env';
  props: Record<string, DependencyProp>;
  children: ViewParticle[];
}

export interface ExpParticle {
  type: 'exp';
  content: DependencyProp;
  props: Record<string, DependencyProp>;
}

export interface SnippetParticle {
  type: 'snippet';
  tag: string;
  props: Record<string, DependencyProp>;
  children: ViewParticle[];
}

export type ViewParticle =
  | TemplateParticle
  | TextParticle
  | HTMLParticle
  | CompParticle
  | ForParticle
  | IfParticle
  | EnvParticle
  | ExpParticle
  | SwitchParticle
  | SnippetParticle
  | TryParticle;

export interface ReactivityParserConfig {
  babelApi: typeof Babel;
  availableProperties: string[];
  availableIdentifiers?: string[];
  reactiveBitMap: ReactiveBitMap;
  identifierDepMap?: Record<string, string[]>;
  dependencyParseType?: 'property' | 'identifier';
  parseTemplate?: boolean;
  reactivityFuncNames?: string[];
}

// TODO: unify with the types in babel-inula-next-core
type Bitmap = number;
export type ReactiveBitMap = Map<string, Bitmap>;
