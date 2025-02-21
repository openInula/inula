import { InulaNodeType } from '../../consts'
import { Bits, InulaBaseNode } from '../../types'
import { update } from '../utils'

class FragmentNode implements InulaBaseNode {
  inulaType = InulaNodeType.Fragment;

  nodes

  dirtyBits?: Bits;

  constructor(nodes: InulaBaseNode[]) {
    this.nodes = nodes
  }

  update() {
    for (let i = 0; i < this.nodes!.length; i++) {
      update(this.nodes![i], this.dirtyBits!)
    }
  }
}

/**
 * @brief Create a createFragmentNode node, will be unwrapped when rendered
 * @returns 
 */
export const createFragmentNode = (...nodes: InulaBaseNode[]): InulaBaseNode => {
  return new FragmentNode(nodes)
}

