/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import assign from 'object-assign';
import { VNode } from '../../../inula/src/renderer/vnode/VNode';

const overlayStyles = {
  background: 'rgba(120, 170, 210, 0.7)',
  padding: 'rgba(77, 200, 0, 0.3)',
  margin: 'rgba(255, 155, 0, 0.3)',
  border: 'rgba(255, 200, 50, 0.3)'
};

type Rect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

function setBoxStyle(eleStyle, boxArea, node) {
  assign(node.style, {
    borderTopWidth: eleStyle[boxArea + 'Top'] + 'px',
    borderLeftWidth: eleStyle[boxArea + 'Left'] + 'px',
    borderRightWidth: eleStyle[boxArea + 'Right'] + 'px',
    borderBottomWidth: eleStyle[boxArea + 'Bottom'] + 'px',
  });
}

function getOwnerWindow(node: Element): typeof window | null {
  if (!node.ownerDocument) {
    return null;
  }
  return node.ownerDocument.defaultView;
}

function getOwnerIframe(node: Element): Element | null {
  const nodeWindow = getOwnerWindow(node);
  if (nodeWindow) {
    return nodeWindow.frameElement;
  }
  return null;
}

function getElementStyle(domElement: Element) {
  const style = window.getComputedStyle(domElement);
  return{
    marginLeft: parseInt(style.marginLeft, 10),
    marginRight: parseInt(style.marginRight, 10),
    marginTop: parseInt(style.marginTop, 10),
    marginBottom: parseInt(style.marginBottom, 10),
    borderLeft: parseInt(style.borderLeftWidth, 10),
    borderRight: parseInt(style.borderRightWidth, 10),
    borderTop: parseInt(style.borderTopWidth, 10),
    borderBottom: parseInt(style.borderBottomWidth, 10),
    paddingLeft: parseInt(style.paddingLeft, 10),
    paddingRight: parseInt(style.paddingRight, 10),
    paddingTop: parseInt(style.paddingTop, 10),
    paddingBottom: parseInt(style.paddingBottom, 10)
  };
}

function mergeRectOffsets(rects: Array<Rect>): Rect {
  return rects.reduce((previousRect, rect) => {
    if (previousRect == null) {
      return rect;
    }

    return {
      top: previousRect.top + rect.top,
      left: previousRect.left + rect.left,
      width: previousRect.width + rect.width,
      height: previousRect.height + rect.height,
      bottom: previousRect.bottom + rect.bottom,
      right: previousRect.right + rect.right
    };
  });
}

function getBoundingClientRectWithBorderOffset(node: Element) {
  const dimensions = getElementStyle(node);
  return mergeRectOffsets([
    node.getBoundingClientRect(),
    {
      top: dimensions.borderTop,
      left: dimensions.borderLeft,
      bottom: dimensions.borderBottom,
      right:dimensions.borderRight,
      // 高度和宽度不会被使用
      width: 0,
      height: 0
    }
  ]);
}

function getNestedBoundingClientRect(
  node: HTMLElement,
  boundaryWindow
): Rect {
  const ownerIframe = getOwnerIframe(node);
  if (ownerIframe && ownerIframe !== boundaryWindow) {
    const rects = [node.getBoundingClientRect()] as Rect[];
    let currentIframe = ownerIframe;
    let onlyOneMore = false;
    while (currentIframe) {
      const rect = getBoundingClientRectWithBorderOffset(currentIframe);
      rects.push(rect);
      currentIframe = getOwnerIframe(currentIframe);

      if (onlyOneMore) {
        break;
      }

      if (currentIframe &&getOwnerWindow(currentIframe) === boundaryWindow) {
        onlyOneMore = true;
      }
    }

    return mergeRectOffsets(rects);
  } else {
    return node.getBoundingClientRect();
  }
}

// 用来遮罩
class OverlayRect {
  node: HTMLElement;
  border: HTMLElement;
  padding: HTMLElement;
  content: HTMLElement;

  constructor(doc: Document, container: HTMLElement) {
    this.node = doc.createElement('div');
    this.border = doc.createElement('div');
    this.padding = doc.createElement('div');
    this.content = doc.createElement('div');

    this.border.style.borderColor = overlayStyles.border;
    this.padding.style.borderColor = overlayStyles.padding;
    this.content.style.backgroundColor = overlayStyles.background;

    assign(this.node.style, {
      borderColor: overlayStyles.margin,
      pointerEvents: 'none',
      position: 'fixed'
    });

    this.node.style.zIndex = '10000000';

    this.node.appendChild(this.border);
    this.border.appendChild(this.padding);
    this.padding.appendChild(this.content);
    container.appendChild(this.node);
  }

  remove() {
    if (this.node.parentNode) {
      this.node.parentNode.removeChild(this.node);
    }
  }

  update(boxRect: Rect, eleStyle: any) {
    setBoxStyle(eleStyle, 'margin', this.node);
    setBoxStyle(eleStyle, 'border', this.border);
    setBoxStyle(eleStyle, 'padding', this.padding);

    assign(this.content.style, {
      height: boxRect.height - eleStyle.borderTop - eleStyle.borderBottom - eleStyle.paddingTop - eleStyle.paddingBottom + 'px',
      width: boxRect.width - eleStyle.borderLeft - eleStyle.borderRight - eleStyle.paddingLeft - eleStyle.paddingRight + 'px'
    });

    assign(this.node.style, {
      top: boxRect.top - eleStyle.marginTop + 'px',
      left: boxRect.left - eleStyle.marginLeft + 'px'
    });
  }
}

class ElementOverlay {
  window: typeof window;
  container: HTMLElement;
  rects: Array<OverlayRect>;

  constructor() {
    this.window = window;
    const doc = window.document;
    this.container = doc.createElement('div');
    this.container.style.zIndex = '10000000';
    this.rects = [];

    doc.body.appendChild(this.container);
  }

  remove() {
    this.rects.forEach(rect => {
      rect.remove();
    });
    this.rects.length = 0;
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  execute(nodes: Array<VNode>) {
    const elements = nodes.filter(node => node.tag === 'DomComponent');

    // 有几个 element 就添加几个 OverlayRect
    while (this.rects.length > elements.length) {
      const rect = this.rects.pop();
      rect.remove();
    }
    if (elements.length === 0) {
      return;
    }

    while (this.rects.length < elements.length) {
      this.rects.push(new OverlayRect(this.window.document, this.container));
    }

    const outerBox = {
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
      left: Number.POSITIVE_INFINITY
    };

    elements.forEach((element, index) => {
      const eleStyle = getElementStyle(element.realNode);
      const boxRect = getNestedBoundingClientRect(element.realNode, this.window);

      outerBox.top = Math.min(outerBox.top, boxRect.top - eleStyle.marginTop);
      outerBox.right = Math.max(outerBox.right, boxRect.left + boxRect.width + eleStyle.marginRight);
      outerBox.bottom = Math.max(outerBox.bottom, boxRect.top + boxRect.height + eleStyle.marginBottom);
      outerBox.left = Math.min(outerBox.left, boxRect.left - eleStyle.marginLeft);

      const rect = this.rects[index];
      rect.update(boxRect, eleStyle);
    });
  }
}

let elementOverlay: ElementOverlay | null = null;
export function hideHighlight() {
  if (elementOverlay !== null) {
    elementOverlay.remove();
    elementOverlay = null;
  }
}

export function showHighlight(elements: Array<VNode> | null) {
  if (window.document == null || elements == null) {
    return;
  }

  if (elementOverlay === null) {
    elementOverlay = new ElementOverlay();
  }

  elementOverlay.execute(elements);
}
