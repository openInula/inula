import { TextParticle } from '@openinula/reactivity-parser';
import { HTMLParticle } from '@openinula/reactivity-parser';

export interface TemplateContentGenerator<Ctx> {
  html: (particle: HTMLParticle, ctx: Ctx) => void;
  text: (particle: TextParticle, ctx: Ctx) => void;
}
