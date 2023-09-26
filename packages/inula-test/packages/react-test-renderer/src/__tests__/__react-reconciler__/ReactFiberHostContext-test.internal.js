/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

'use strict';

import {TreeRoot} from 'inula/src/renderer/vnode/VNodeTags';
import {initDomProps} from "../../ReactTestHostConfig";
let React;
let Reconciler;

describe('ReactFiberHostContext', () => {
  beforeEach(() => {
    jest.resetModules();
    Reconciler = require('renderer');
  });

  it('works with null host context', () => {
    let creates = 0;
    const Renderer = Reconciler({
      prepareForSubmit: function() {},
      resetAfterSubmit: function() {},
      getNSCtx: function () {
        return null;
      },
      isTextChild: function() {
        return false;
      },
      newDom: function() {
        creates++;
      },
      initDomProps: function() {
        return null;
      },
      now: function() {
        return 0;
      },
      appendChildElement: function () {
        return null;
      },
      clearContainer: function() {},
      supportsMutation: true,
    });

    React = require('horizon-external');

    const container = Renderer.createVNode(
      TreeRoot,
      /* root: */ null,
    );
    Renderer.startUpdate(
      <a>
        <b />
      </a>,
      container,
      /* callback: */ null,
    );
    expect(creates).toBe(2);
  });

  it('should send the context to prepareForSubmit and resetAfterSubmit', () => {
    const rootContext = {};
    const Renderer = Reconciler({
      prepareForSubmit: function(hostContext) {
        expect(hostContext).toBe(undefined);
      },
      resetAfterSubmit: function(hostContext) {
        expect(hostContext).toBe(undefined);
      },
      getNSCtx: function() {
        return null;
      },
      isTextChild: function() {
        return false;
      },
      newDom: function() {
        return null;
      },
      initDomProps: function() {
        return null;
      },
      now: function() {
        return 0;
      },
      appendChildElement: function() {
        return null;
      },
      clearContainer: function() {},
      supportsMutation: true,
    });

    React = require('horizon-external');

    const container = Renderer.createVNode(
      TreeRoot,
      rootContext,
    );
    Renderer.startUpdate(
      <a>
        <b />
      </a>,
      container,
      /* callback: */ null,
    );
  });
});
