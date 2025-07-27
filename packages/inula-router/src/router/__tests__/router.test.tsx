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

import { render, act } from 'openinula';
import { historyHook, locationHook, Test_Demo, Test_Demo2, Test_Demo3, Test_Demo4 } from './test_app';
import { createBrowserHistory, createHashHistory, Router } from '../index';

describe('Inula-router Test', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('Render app and Jump use <Link>', async () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
      container
    );

    expect(locationHook.pathname).toEqual('/');
    expect(container.textContent).toMatch(/you are home/i);

    // 模拟点击事件
    const aboutLink = container.querySelector('a[href="/about"]');
    if (aboutLink) {
      aboutLink.click();
    }
    expect(locationHook.pathname).toEqual('/about');
    expect(container.textContent).toMatch(/you are on the about page/i);

    const userLink = container.querySelector('a[href="/user"]');
    if (userLink) {
      userLink.click();
    }
    expect(locationHook.pathname).toEqual('/user');
    expect(container.textContent).toMatch(/You are at User Index/i);
  });

  it('Test hooks and use hook to jump to page', () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
      container
    );

    act(() => {
      historyHook.push('/');
    });

    expect(locationHook.pathname).toEqual('/');
    act(() => {
      historyHook.push('/about');
    });

    expect(container.textContent).toMatch(/you are on the about page/i);

    act(() => {
      historyHook.push('/user');
    });
    expect(locationHook.pathname).toEqual('/user');
    expect(container.textContent).toMatch(/You are at User Index/i);

    act(() => {
      historyHook.push('/test');
    });
    expect(locationHook.pathname).toEqual('/test');
    expect(container.textContent).toMatch(/No match/i);
  });

  it('Test Redirect', () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
      container
    );

    act(() => {
      historyHook.push('/default');
    });
    expect(container.textContent).toMatch(/No match/i);

    act(() => {
      historyHook.push('/test2');
    });
    expect(locationHook.pathname).toEqual('/redirect');
    expect(container.textContent).toMatch(/No match/i);
  });

  it('Test useParams Hook', () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
      container
    );

    act(() => {
      historyHook.push('/profile/123');
    });
    expect(locationHook.pathname).toEqual('/profile/123');

    expect(container.textContent).toMatch(/Param is 123/i);
  });

  it('Test WithRouter', () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
      container
    );

    act(() => {
      historyHook.push('/testr');
    });

    expect(locationHook.pathname).toEqual('/testr');
    expect(container.textContent).toMatch(/withRoute Test, pathname--\/testr/);
  });

  it('Test Prompt', async () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo2 />
      </Router>,
      container
    );

    const aboutLink = container.querySelector('a[href="/about"]');
    if (aboutLink) {
      aboutLink.click();
    }
    expect(container.textContent.includes('you are on the about page')).toBe(false);

    const userLink = container.querySelector('a[href="/user"]');
    if (userLink) {
      userLink.click();
    }
    expect(container.textContent.includes('You are at User Index')).toBe(true);
  });

  it('Test Init Render Redirect', () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo3 />
      </Router>,
      container
    );

    expect(container.textContent.includes('you are home')).toBe(false);
    expect(container.textContent.includes('You are at User Index')).toBe(true);
  });

  it('<Redirect/> support props path and wildcard', () => {
    const history = createHashHistory();
    render(
      <Router history={history}>
        <Test_Demo4 />
      </Router>,
      container
    );

    expect(container.textContent.includes('you are home')).toBe(false);
    expect(container.textContent.includes('you are on the about page')).toBe(false);
    expect(container.textContent.includes('You are at User Index')).toBe(true);
  });
});
