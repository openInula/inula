import { describe, expect, it, afterAll, beforeAll } from 'vitest';
import { config, parse, parseCode, parseView } from './mock';
import { types as t } from '@babel/core';
import type { CompUnit, HTMLUnit } from '../index';

describe('ElementUnit', () => {
  beforeAll(() => {
    // ---- Ignore template for this test
    config.parseTemplate = false;
  });

  afterAll(() => {
    config.parseTemplate = true;
  });

  // ---- Type
  it('should identify a JSX element with tag in htmlTags as an HTMLUnit', () => {
    const viewUnits = parse('<div></div>');
    expect(viewUnits.type).toBe('html');
  });

  it('should identify a JSX element with tag not in htmlTags as an CompUnit', () => {
    const viewUnits = parse('<Comp></Comp>');
    expect(viewUnits.type).toBe('comp');
  });

  it('should identify a JSX element with namespaced "html" outside htmlTags as an HTMLUnit', () => {
    const viewUnits = parse('<html:MyWebComponent></html:MyWebComponent>');
    expect(viewUnits.type).toBe('html');
  });

  it('should identify a JSX element with namespaced "tag" outside htmlTags as an HTMLUnit', () => {
    const viewUnits = parse('<tag:variable></tag:variable>');
    expect(viewUnits.type).toBe('html');
  });

  it('should identify a JSX element with namespaced "comp" inside htmlTags as an HTMLUnit', () => {
    const viewUnits = parse('<comp:div></comp:div>');
    expect(viewUnits.type).toBe('comp');
  });

  it('should identify a JSX element with name equal to "env" as an EnvUnit', () => {
    const viewUnits = parse('<SomeContext></SomeContext>');
    expect(viewUnits.type).toBe('context');
  });

  // ---- Tag
  it('should correctly parse the tag of an HTMLUnit', () => {
    const viewUnits = parse('<div></div>');
    const tag = (viewUnits as HTMLUnit).tag;

    expect(t.isStringLiteral(tag, { value: 'div' })).toBeTruthy();
  });

  it('should correctly parse the tag of an HTMLUnit with namespaced "html"', () => {
    const viewUnits = parse('<html:MyWebComponent></html:MyWebComponent>');
    const tag = (viewUnits as HTMLUnit).tag;

    expect(t.isStringLiteral(tag, { value: 'MyWebComponent' })).toBeTruthy();
  });

  it('should correctly parse the tag of an HTMLUnit with namespaced "tag"', () => {
    const viewUnits = parse('<tag:variable></tag:variable>');
    const tag = (viewUnits as HTMLUnit).tag;

    expect(t.isIdentifier(tag, { name: 'variable' })).toBeTruthy();
  });

  it('should correctly parse the tag of an CompUnit', () => {
    const viewUnits = parse('<Comp></Comp>');
    const tag = (viewUnits as HTMLUnit).tag;

    expect(t.isIdentifier(tag, { name: 'Comp' })).toBeTruthy();
  });

  it('should correctly parse the tag of an CompUnit with namespaced "comp"', () => {
    const viewUnits = parse('<comp:div></comp:div>');
    const tag = (viewUnits as HTMLUnit).tag;

    expect(t.isIdentifier(tag, { name: 'div' })).toBeTruthy();
  });

  // ---- Props(for both HTMLUnit and CompUnit)
  it('should correctly parse the props', () => {
    const viewUnits = parse('<div id="myId"></div>');

    const htmlUnit = viewUnits as HTMLUnit;
    const props = htmlUnit.props!;
    expect(t.isStringLiteral(props.id.value, { value: 'myId' })).toBeTruthy();
  });

  it('should correctly parse the props with a complex expression', () => {
    const ast = parseCode('<div onClick={() => {console.log("ok")}}></div>');
    const viewUnits = parseView(ast);

    const originalExpression = (
      ((ast as t.JSXElement).openingElement.attributes[0] as t.JSXAttribute).value as t.JSXExpressionContainer
    ).expression;

    const htmlUnit = viewUnits as HTMLUnit;
    expect(htmlUnit.props!.onClick.value).toBe(originalExpression);
  });

  it('should correctly parse multiple props', () => {
    const viewUnits = parse('<div id="myId" class="myClass"></div>');

    const htmlUnit = viewUnits as HTMLUnit;
    const props = htmlUnit.props!;
    expect(Object.keys(props).length).toBe(2);
    expect(t.isStringLiteral(props.id.value, { value: 'myId' })).toBeTruthy();
    expect(t.isStringLiteral(props.class.value, { value: 'myClass' })).toBeTruthy();
  });

  it('should correctly parse props with namespace as its specifier', () => {
    const viewUnits = parse('<div bind:id="myId"></div>');
    const htmlUnit = viewUnits as HTMLUnit;
    const props = htmlUnit.props!;
    expect(props.id.specifier).toBe('bind');
    expect(t.isStringLiteral(props.id.value, { value: 'myId' })).toBeTruthy();
  });

  it('should correctly parse spread props', () => {
    const viewUnits = parse('<Comp {...props}></Comp>');
    const htmlUnit = viewUnits as CompUnit;
    const props = htmlUnit.props!;
    expect(t.isIdentifier(props['*spread*'].value, { name: 'props' })).toBeTruthy();
  });

  // ---- View prop (other test cases can be found in ExpUnit.test.ts)
  it('should correctly parse sub jsx attribute as view prop', () => {
    const ast = parseCode('<Comp sub=<div>Ok</div>></Comp>');
    const viewUnits = parseView(ast);

    const props = (viewUnits as CompUnit).props!;
    const viewPropMap = props.sub.viewPropMap!;
    expect(Object.keys(viewPropMap).length).toBe(1);

    const key = Object.keys(viewPropMap)[0];
    const viewProp = viewPropMap[key];
    expect(viewProp.length).toBe(1);
    expect(viewProp[0].type).toBe('html');

    // ---- Prop View will be replaced with a random string and stored in props.viewPropMap
    const value = props.sub.value;
    expect(t.isStringLiteral(value, { value: key })).toBeTruthy();
  });

  // ---- Children(for both HTMLUnit and CompUnit)
  it('should correctly parse the count of children', () => {
    const viewUnits = parse(`<div>
      <div>ok</div>
      <div>ok</div>
      <Comp></Comp>
      <Comp></Comp>
    </div>`);
    const htmlUnit = viewUnits as HTMLUnit;
    expect(htmlUnit.children!.length).toBe(4);
  });

  it('should correctly parse the count of children with JSXExpressionContainer', () => {
    const viewUnits = parse(`<div>
      <div>ok</div>
      <div>ok</div>
      {count}
      {count}
    </div>`);
    const htmlUnit = viewUnits as HTMLUnit;
    expect(htmlUnit.children!.length).toBe(4);
  });

  it('should correctly parse the count of children with JSXFragment', () => {
    const viewUnits = parse(`<div>
      <div>ok</div>
      <div>ok</div>
      <>
        <Comp></Comp>
        <Comp></Comp>
      </>
    </div>`);
    const htmlUnit = viewUnits as HTMLUnit;
    expect(htmlUnit.children!.length).toBe(3);
  });
});
