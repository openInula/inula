import { describe, expect, it } from 'vitest';
import { parse } from './mock';
import { types as t } from '@babel/core';
import { FragmentUnit, HTMLUnit, IfUnit } from '../types';

describe('IfUnit', () => {
  // ---- Type
  it('should identify if unit', () => {
    const viewUnits = parse('<if cond={true}>true</if>');
    expect(viewUnits.type).toBe('if');
  });

  it('should identify if unit with else', () => {
    const viewUnits = parse(`<>
      <if cond={true}>true</if>
      <else>false</else>
    </>`) as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('if');
  });

  it('should identify if unit with else-if', () => {
    const viewUnits = parse(`<>
      <if cond={true}>true</if>
      <else-if cond={false}>false</else-if>
    </>`) as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('if');
  });

  it('should find matched if in html tag', () => {
    const viewUnits = parse(`<section>
      <if cond={true}>true</if>
      <else>false</else>
    </section>`) as unknown as HTMLUnit;
    expect(viewUnits.children[0].type).toBe('if');
  });

  it('should identify if unit with else-if and else', () => {
    const viewUnits = parse(`<>
      <if cond={true}>true</if>
      <else-if cond={false}>false</else-if>
      <else>else</else>
    </>`) as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('if');
  });

  it('should identify if unit with multiple else-if', () => {
    const viewUnits = parse(`<>
      <if cond={true}>true</if>
      <else-if cond={flag1}>flag1</else-if>
      <else-if cond={flag2}>flag2</else-if>
      <else>else</else>
    </>`) as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('if');
  });

  // ---- Branches
  it('should correctly parse branches count for if unit', () => {
    const viewUnits = parse(`<>
      <if cond={true}>true</if>
      <else-if cond={flag1}>flag1</else-if>
      <else-if cond={flag2}>flag2</else-if>
      <else>else</else>
    </>`) as FragmentUnit;

    const branches = (viewUnits.children[0] as IfUnit).branches;
    expect(branches.length).toBe(4);
  });

  it("should correctly parse branches' condition for if unit", () => {
    const viewUnits = parse('<if cond={true}>true</if>');
    const branches = (viewUnits as IfUnit).branches;

    expect(t.isBooleanLiteral(branches[0].condition, { value: true })).toBeTruthy();
  });

  it("should correctly parse branches' children for if unit", () => {
    const viewUnits = parse('<if cond={true}>true</if>');
    const branches = (viewUnits as IfUnit).branches;

    expect(branches[0].children.length).toBe(1);
    expect(branches[0].children[0].type).toBe('text');
  });

  it("should correctly parse branches' condition for if unit with else", () => {
    const viewUnits = parse(`<>
      <if cond={flag1}>1</if>
      <else>2</else>
    </>`) as FragmentUnit;
    const branches = (viewUnits.children[0] as IfUnit).branches;

    expect(t.isIdentifier(branches[0].condition, { name: 'flag1' })).toBeTruthy();
    expect(t.isBooleanLiteral(branches[1].condition, { value: true })).toBeTruthy();
  });

  it("should correctly parse branches' children for if unit with else", () => {
    const viewUnits = parse(`<>
      <if cond={true}>true</if>
      <else>false</else>
    </>`) as FragmentUnit;
    const branches = (viewUnits.children[0] as IfUnit).branches;

    expect(branches[0].children.length).toBe(1);
    expect(branches[0].children[0].type).toBe('text');
    expect(branches[1].children.length).toBe(1);
    expect(branches[1].children[0].type).toBe('text');
  });

  it("should correctly parse branches' condition for if unit with else-if", () => {
    const viewUnits = parse(`<>
      <if cond={flag1}>1</if>
      <else-if cond={flag2}>2</else-if>
    </>`) as FragmentUnit;
    const branches = (viewUnits.children[0] as IfUnit).branches;
    /**
     * () => {
     * if (flag1) {
     *   this._prevCond
     *  return 1
     * } else () {
     *  if (flag2) {
     * }
     * }
     */

    expect(t.isIdentifier(branches[0].condition, { name: 'flag1' })).toBeTruthy();
    expect(t.isIdentifier(branches[1].condition, { name: 'flag2' })).toBeTruthy();
  });

  it("should correctly parse branches' children for if unit with else-if", () => {
    const viewUnits = parse(`<>
      <if cond={true}>true</if>
      <else-if cond={false}>false</else-if>
    </>`) as FragmentUnit;
    const branches = (viewUnits.children[0] as IfUnit).branches;

    expect(branches[0].children.length).toBe(1);
    expect(branches[0].children[0].type).toBe('text');
    expect(branches[1].children.length).toBe(1);
    expect(branches[1].children[0].type).toBe('text');
  });

  // --- nested
  it('should correctly parse nested if unit', () => {
    const viewUnits = parse(`<>
      <if cond={true}>
        <if cond={true}>true</if>
      </if>
    </>`) as FragmentUnit;
    const branches = (viewUnits.children[0] as IfUnit).branches;

    expect(branches.length).toBe(1);
    expect(branches[0].children[0].type).toBe('if');
  });

  it('should correctly parse nested if unit with else', () => {
    const viewUnits = parse(`<>
      <if cond={true}>
        <if cond={true}>true</if>
        <else>false</else>
      </if>
    </>`) as FragmentUnit;
    const branches = (viewUnits.children[0] as IfUnit).branches;

    expect(branches.length).toBe(1);
    expect(branches[0].children[0].type).toBe('if');
  });

  it('should throw error for nested if unit with else-if', () => {
    expect(() => {
      parse(`<>
        <if cond={true}>
          <else>false</else-if>
        </if>
      </>`);
    }).toThrowError();
  });

  it('test', () => {
    expect(
      parse(`
  <>
      <h1 className="123">Hello inulax next fn comp</h1>
      <section>
        count: {count}, double is: {db}
        <button onClick={() => (count += 1)}>Add</button>
      </section>
      <Button onClick={() => alert(count)}>Alter count</Button>
      <h1>Condition</h1>
      <if cond={count > 1}>{count} is bigger than is 1</if>
      <else>{count} is smaller than 1</else>
      <ArrayModification />
    </>
    `)
    );
  });
});
