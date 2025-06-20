/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { If, ElseIf, Else, ConditionalRenderer } from '../../src/vue/condition';

import { act, useRef, useState, vueReactive } from 'openinula';
import { describe, expect, it, vi } from 'vitest';
import '../utils/globalSetup';
import { createApp } from '../../src/vue';

const { useReactive, useReference } = vueReactive;

describe('Condition Component', () => {
  it('Should ConditionalRenderer work', () => {
    let _ref;
    let _updateType;

    function Comp() {
      const ref = useRef();
      _ref = ref;
      const [type, setType] = useState('A');

      const updateType = val => {
        setType(val);
      };
      _updateType = updateType;

      return (
        <div>
          <div ref={ref}>
            <ConditionalRenderer>
              <If condition={type === 'A'}>{type === 'A' && <div>A</div>}</If>
              <ElseIf condition={type === 'B'}>{type === 'B' && <div>B</div>}</ElseIf>
              <ElseIf condition={type === 'C'}>{type === 'C' && <div>C</div>}</ElseIf>
              <Else>
                <div>Not A/B/C</div>
              </Else>
            </ConditionalRenderer>
          </div>
        </div>
      );
    }

    const app = createApp(<Comp />);

    app.mount(global.container);

    expect(_ref.current.innerHTML).toBe('<div>A</div>');

    act(() => {
      _updateType('B');
    });

    expect(_ref.current.innerHTML).toBe('<div>B</div>');

    act(() => {
      _updateType('XX');
    });

    expect(_ref.current.innerHTML).toBe('<div>Not A/B/C</div>');
  });

  it('Should ConditionalRenderer work with reactive data', () => {
    let _options;
    let _ref;

    function Comp() {
      const ref = useRef();
      _ref = ref;

      const options = useReactive({
        fileName: '',
        fileNames: [],
        uploadStatus: '',
        progress: 0,
      });
      _options = options;

      const $t = val => {
        return val;
      };

      return (
        <div ref={ref}>
          <ConditionalRenderer>
            <If condition={!options.fileName && !options.fileNames}>
              {!options.fileName && !options.fileNames && <div></div>}
            </If>
            <ElseIf condition={options.uploadStatus === 'COMPLETED' && options.progress === 100}>
              {options.uploadStatus === 'COMPLETED' && options.progress === 100 && (
                <div id="sucessUpLoadFile">
                  <img src="/static/images/001_18.png" />
                  <span>{$t('SynchronizedData')}</span>
                </div>
              )}
            </ElseIf>
            <ElseIf condition={options.uploadStatus === 'UPLOADING' && options.progress < 100 && options.progress >= 0}>
              {options.uploadStatus === 'UPLOADING' && options.progress < 100 && options.progress >= 0 && (
                <div className="continueContent">
                  <div className="progressBar" style="width: 50%">
                    <div className="finishProgressBar" style={{ width: options.progress + '%' }}></div>
                    <span className="progressPercent">{options.progress + '%'}</span>
                  </div>
                </div>
              )}
            </ElseIf>
            <ElseIf condition={options.progress === 100 && options.uploadStatus === 'FAILURE'}>
              {options.progress === 100 && options.uploadStatus === 'FAILURE' && (
                <div id="failUpLoadFile">
                  <div className="errImg"></div>
                  <span>
                    {$t('Fail')}
                    <b onClick="replicateErrMessage(options)" className="dataMessage">
                      {$t('viewDetails')}
                    </b>
                  </span>
                </div>
              )}
            </ElseIf>
            <Else>
              <div>Other</div>
            </Else>
          </ConditionalRenderer>
        </div>
      );
    }

    const app = createApp(<Comp />);

    app.mount(global.container);

    expect(_ref.current.innerHTML).toBe('<div>Other</div>');

    act(() => {
      _options.uploadStatus = 'COMPLETED';
      _options.progress = 100;
    });

    expect(_ref.current.innerHTML).toBe(
      '<div id="sucessUpLoadFile"><img src="/static/images/001_18.png"><span>SynchronizedData</span></div>'
    );

    act(() => {
      _options.uploadStatus = 'FAILURE';
    });

    expect(_ref.current.innerHTML).toBe(
      '<div id="failUpLoadFile"><div class="errImg"></div><span>Fail<b class="dataMessage">viewDetails</b></span></div>'
    );

    act(() => {
      _options.uploadStatus = 'XXX';
    });

    expect(_ref.current.innerHTML).toBe('<div>Other</div>');
  });

  it('Should ConditionalRenderer work with ref array', () => {
    let _ref;

    function Comp() {
      const ref = useRef();
      _ref = ref;

      const item = useReactive({
        value: 40,
        label: 'AGG',
        disabled: true,
        tips: true,
      });

      return (
        <div ref={ref}>
          <ConditionalRenderer>
            <If condition={item.formater}>
              {/*即使condition中有了”item.formater“，还是必须增加"item.formater &&"，因为JSX会被直接执行了，可能导致错误。*/}
              {item.formater && <div className="unbi-interval-slider-title">{item.formater(item)}</div>}
            </If>
            <ElseIf condition={item.label}>
              {item.label && <div className="unbi-interval-slider-title">{item.label}</div>}
            </ElseIf>
            <Else>
              <div className="unbi-interval-slider-title">{item.value}</div>
            </Else>
          </ConditionalRenderer>
        </div>
      );
    }

    const app = createApp(<Comp />);

    app.mount(global.container);

    expect(_ref.current.innerHTML).toBe('<div class="unbi-interval-slider-title">AGG</div>');
  });
});
