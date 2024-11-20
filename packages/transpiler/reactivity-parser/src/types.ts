import { type types as t } from '@babel/core';
import type Babel from '@babel/core';
import { Dependency } from './getDependencies';

export interface DependencyValue<T> extends Dependency {
  value: T;
}

export interface DependencyProp extends DependencyValue<t.Expression> {
  viewPropMap: Record<string, ViewParticle[]>;
}

export interface TemplateProp extends DependencyValue<t.Expression> {
  tag: string;
  key: string;
  path: number[];
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
  reactiveIndexMap: ReactiveBitMap;
  dependencyParseType?: 'property' | 'identifier';
  parseTemplate?: boolean;
  reactivityFuncNames?: string[];
  /**
   * @brief A map of derived reactive variables to their source reactive variables
   */
  derivedMap?: Map<string, string[]>;
}

// TODO: unify with the types in babel-inula-next-core
export type Bitmap = number;
export type ReactiveBitMap = Map<string, Bitmap>;
