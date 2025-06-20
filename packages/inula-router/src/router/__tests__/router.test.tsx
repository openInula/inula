import * as React from 'react';
import { historyHook, locationHook, Test_Demo, Test_Demo2, Test_Demo3, Test_Demo4 } from './test_app';
import { createBrowserHistory, createHashHistory, Router } from '../index';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

describe('Inula-router Test', () => {

  it('Render app and Jump use <Link>', async () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
    );
    const user = userEvent.setup();
    expect(locationHook.pathname).toEqual('/');
    expect(screen.getByText(/you are home/i)).toBeInTheDocument();

    await user.click(screen.getByText(/about/i));
    expect(locationHook.pathname).toEqual('/about');
    expect(screen.getByText(/you are on the about page/i)).toBeInTheDocument();

    await user.click(screen.getByText(/user/i));
    expect(locationHook.pathname).toEqual('/user');
    expect(screen.getByText(/You are at User Index/i)).toBeInTheDocument();
  });

  it('Test hooks and use hook to jump to page', async () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
    );

    act(() => {
      historyHook.push('/');
    });

    expect(locationHook.pathname).toEqual('/');
    act(() => {
      historyHook.push('/about');
    });

    expect(screen.getByText(/you are on the about page/i)).toBeInTheDocument();

    act(() => {
      historyHook.push('/user');
    });
    expect(locationHook.pathname).toEqual('/user');
    expect(screen.getByText(/You are at User Index/i)).toBeInTheDocument();

    act(() => {
      historyHook.push('/test');
    });
    expect(locationHook.pathname).toEqual('/test');
    expect(screen.getByText(/No match/i)).toBeInTheDocument();

  });

  it('Test Redirect', async () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
    );

    act(() => {
      historyHook.push('/default');
    });
    expect(screen.getByText(/No match/i)).toBeInTheDocument();

    act(() => {
      historyHook.push('/test2');
    });
    // '/test2'会重定向至'/redirect'
    expect(locationHook.pathname).toEqual('/redirect');
    expect(screen.getByText(/No match/i)).toBeInTheDocument();
  });

  it('Test useParams Hook', async () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
    );

    act(() => {
      historyHook.push('/profile/123');
    });
    expect(locationHook.pathname).toEqual('/profile/123');

    expect(screen.getByText(/Param is 123/i)).toBeInTheDocument();

  });

  it('Test WithRouter', async () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo />
      </Router>,
    );

    act(() => {
      historyHook.push('/testr');
    });

    expect(locationHook.pathname).toEqual('/testr');

    // 测试WithRouter是否正确注入Props
    expect(screen.getByText('withRoute Test, pathname--/testr')).toBeInTheDocument();

  });

  it('Test Prompt', async () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo2 />
      </Router>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText(/about/i));
    // 查找结果为Null说明Prompt组件已成功拦截前往/about的跳转行为
    expect(screen.queryByText(/you are on the about page/i)).toBeNull();

    await user.click(screen.getByText(/user/i));
    expect(screen.queryByText(/You are at User Index/i)).not.toBeNull();
  });

  it('Test Init Render Redirect', () => {
    const history = createBrowserHistory();
    render(
      <Router history={history}>
        <Test_Demo3 />
      </Router>,
    );
    // 初次渲染重定向至User Index
    expect(screen.queryByText(/you are home/i)).toBeNull();

    expect(screen.queryByText(/You are at User Index/i)).not.toBeNull();
  });

  it('<Redirect/> support props path and wildcard', () => {
    const history = createHashHistory();
    render(
      <Router history={history}>
        <Test_Demo4 />
      </Router>,
    );
    // 初次渲染重定向至User Index
    expect(screen.queryByText(/you are home/i)).toBeNull();
    expect(screen.queryByText(/You are on the about page/i)).toBeNull();

    expect(screen.queryByText(/You are at User Index/i)).not.toBeNull();
  });
});
