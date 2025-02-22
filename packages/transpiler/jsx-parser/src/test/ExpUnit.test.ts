import { describe, expect, it } from 'vitest';
import { parse, parseCode, parseView, wrapWithFile } from './mock';
import { types as t } from '@babel/core';
import type { ExpUnit, FragmentUnit } from '../index';
import { traverse } from '@babel/core';

describe('ExpUnit', () => {
  // ---- Type
  it('should identify expression unit', () => {
    const viewUnits = parse('<>{count}</>') as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('exp');
  });

  it('should not identify literals as expression unit', () => {
    const viewUnits = parse('<>{1}</>') as FragmentUnit;
    expect(viewUnits.children[0].type).not.toBe('exp');
  });

  // ---- Content
  it('should correctly parse content for expression unit', () => {
    const viewUnits = parse('<>{count}</>') as FragmentUnit;
    const content = (viewUnits.children[0] as ExpUnit).content;

    expect(t.isIdentifier(content.value, { name: 'count' })).toBeTruthy();
  });

  it('should correctly parse complex content for expression unit', () => {
    const ast = parseCode('<>{!console.log("hello world") && myComplexFunc(count + 100)}</>');
    const viewUnits = parseView(ast) as FragmentUnit;

    const originalExpression = ((ast as t.JSXFragment).children[0] as t.JSXExpressionContainer).expression;

    const content = (viewUnits.children[0] as ExpUnit).content;
    expect(content.value).toBe(originalExpression);
  });

  it('should correctly parse content with view prop for expression unit', () => {
    // ---- <div>Ok</div> will be replaced with a random string and stored in props.viewPropMap
    const viewUnits = parse('<>{<div>Ok</div>}</>') as FragmentUnit;
    const content = (viewUnits.children[0] as ExpUnit).content;
    const viewPropMap = content.viewPropMap;

    expect(Object.keys(viewPropMap).length).toBe(1);
    const key = Object.keys(viewPropMap)[0];
    const viewProp = viewPropMap[key];
    // ---- Only one view unit for <div>Ok</div>
    expect(viewProp.length).toBe(1);
    expect(viewProp[0].type).toBe('html');

    // ---- The value of the replaced prop should be the key of the viewPropMap
    const value = content.value;
    expect(t.isStringLiteral(value, { value: key })).toBeTruthy();
  });

  it('should correctly parse content with view prop for expression unit with complex expression', () => {
    // ---- <div>Ok</div> will be replaced with a random string and stored in props.viewPropMap
    const ast = parseCode(`<>{
      someFunc(() => {
        console.log("hello world")
        doWhatever()
        return <div>Ok</div>
      })
    }</>`);
    const viewUnits = parseView(ast);

    const content = ((viewUnits as FragmentUnit).children[0] as ExpUnit).content;
    const viewPropMap = content.viewPropMap;

    expect(Object.keys(viewPropMap).length).toBe(1);
    const key = Object.keys(viewPropMap)[0];
    const viewProp = viewPropMap[key];
    // ---- Only one view unit for <div>Ok</div>
    expect(viewProp.length).toBe(1);

    // ---- Check the value of the replaced prop
    let idExistCount = 0;
    traverse(wrapWithFile(content.value), {
      StringLiteral(path) {
        if (path.node.value === key) idExistCount++;
      },
    });
    // ---- Expect the count of the id matching to be exactly 1
    expect(idExistCount).toBe(1);
  });
});
