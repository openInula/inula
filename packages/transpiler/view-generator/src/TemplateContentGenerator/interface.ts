import { TextParticle } from '@openinula/reactivity-parser';
import { HTMLParticle } from '@openinula/reactivity-parser';
import { types as t } from '@openInula/babel-api';

export interface TemplateContentGenerator<Ctx> {
  html: (particle: HTMLParticle, ctx: Ctx) => void;
  text: (particle: TextParticle, ctx: Ctx) => void;
}

export interface GenTemplateContent {
  (particle: HTMLParticle): t.Expression;
}
