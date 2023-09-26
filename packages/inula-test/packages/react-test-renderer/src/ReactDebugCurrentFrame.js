/**
 * @flow
 */

const ReactDebugCurrentFrame = {};

let currentExtraStackFrame = (null: null | string);

export function setExtraStackFrame(stack: null | string) {
  if (isDev) {
    currentExtraStackFrame = stack;
  }
}

if (isDev) {
  ReactDebugCurrentFrame.setExtraStackFrame = function(stack: null | string) {
    if (isDev) {
      currentExtraStackFrame = stack;
    }
  };
  // Stack implementation injected by the current renderer.
  ReactDebugCurrentFrame.getCurrentStack = (null: null | (() => string));

  ReactDebugCurrentFrame.getStackAddendum = function(): string {
    let stack = '';

    // Add an extra top frame while an element is being validated
    if (currentExtraStackFrame) {
      stack += currentExtraStackFrame;
    }

    // Delegate to the injected renderer-specific implementation
    const impl = ReactDebugCurrentFrame.getCurrentStack;
    if (impl) {
      stack += impl() || '';
    }

    return stack;
  };
}

export default ReactDebugCurrentFrame;
