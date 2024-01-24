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

import { render, createElement } from 'openinula';
import Panel from '../panel/Panel';
import PanelX from '../panelX/PanelX';

let panelCreated = false;

const viewSource = () => {
  setTimeout(() => {
    chrome.devtools.inspectedWindow.eval(`
      if (window.$type != null) {
        if (
          window.$type &&
          window.$type.prototype &&
          window.$type.prototype.render
        ) {
          // 类组件
          inspect(window.$type.prototype.render);
        } else {
          // 函数组件
          inspect(window.$type);
        }
      }
    `);
  }, 100);
};

const inspectVNode = () => {
  chrome.devtools.inspectedWindow.eval(
    `
      window.__INULA_DEV_HOOK__ && window.__INULA_DEV_HOOK__.$0 !== $0
      ? (inspect(window.__INULA_DEV_HOOK__.$0.realNode), true)
      : false
    `,
    (_, error) => {
      if (error) {
        console.error(error);
      }
    }
  );
};

let currentPanel = null;

chrome.devtools.inspectedWindow.eval('window.__INULA_DEV_HOOK__', function (isInula, error) {
  if (!isInula || panelCreated) {
    return;
  }

  panelCreated = true;
  chrome.devtools.panels.create('Inula', '', 'panel.html', extensionPanel => {
    extensionPanel.onShown.addListener(panel => {
      if (currentPanel === panel) {
        return;
      }
      currentPanel = panel;
      const container = panel.document.getElementById('root');
      const element = createElement(Panel, { viewSource, inspectVNode });
      render(element, container);
    });
  });

  chrome.devtools.panels.create('InulaX', '', 'panelX.html', extensionPanel => {
    extensionPanel.onShown.addListener(panel => {
      if (currentPanel === panel) {
        return;
      }
      currentPanel = panel;
      const container = panel.document.getElementById('root');
      const element = createElement(PanelX, {});
      render(element, container);
    });
  });
});
