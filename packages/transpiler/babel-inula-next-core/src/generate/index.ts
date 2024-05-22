import { ViewParticle } from '@openinula/reactivity-parser';
import { ComponentNode } from '../analyze/types';

type Visitor = {
  [Type in (ViewParticle | ComponentNode)['type']]: (
    node: Extract<ViewParticle | ComponentNode, { type: Type }>,
    ctx: any
  ) => void;
};
