import { describe, expect, it } from 'vitest';
import { parse } from './mock';
import { types as t } from '@babel/core';
import type { FragmentUnit, TextUnit } from '../index';

describe('TextUnit', () => {
  // ---- Type
  it('should identify text unit', () => {
    const viewUnits = parse('<>hello world</>') as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('text');
  });

  it('should identify text unit with boolean expression', () => {
    const viewUnits = parse('<>{true}</>') as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('text');
  });

  it('should identify text unit with number expression', () => {
    const viewUnits = parse('<>{1}</>') as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('text');
  });

  it('should identify text unit with null expression', () => {
    const viewUnits = parse('<>{null}</>') as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('text');
  });

  it('should identify text unit with string literal expression', () => {
    const viewUnits = parse('<>{"hello world"}</>') as FragmentUnit;
    expect(viewUnits.children[0].type).toBe('text');
  });

  // ---- Content
  it('should correctly parse content for text unit', () => {
    const viewUnits = parse('<>hello world</>') as FragmentUnit;
    const content = (viewUnits.children[0] as TextUnit).content;

    expect(t.isStringLiteral(content, { value: 'hello world' })).toBeTruthy();
  });

  it('should correctly parse content for boolean text unit', () => {
    const viewUnits = parse('<>{true}</>') as FragmentUnit;
    const content = (viewUnits.children[0] as TextUnit).content;

    expect(t.isBooleanLiteral(content, { value: true })).toBeTruthy();
  });

  it('should correctly parse content for number text unit', () => {
    const viewUnits = parse('<>{1}</>') as FragmentUnit;
    const content = (viewUnits.children[0] as TextUnit).content;

    expect(t.isNumericLiteral(content, { value: 1 })).toBeTruthy();
  });

  it('should correctly parse content for null text unit', () => {
    const viewUnits = parse('<>{null}</>') as FragmentUnit;
    const content = (viewUnits.children[0] as TextUnit).content;

    expect(t.isNullLiteral(content)).toBeTruthy();
  });

  it('should correctly parse content for string literal text unit', () => {
    const viewUnits = parse('<>{"hello world"}</>') as FragmentUnit;
    const content = (viewUnits.children[0] as TextUnit).content;

    expect(t.isStringLiteral(content)).toBeTruthy();
  });
});
