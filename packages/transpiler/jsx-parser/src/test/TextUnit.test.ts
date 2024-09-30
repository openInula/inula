import { describe, expect, it } from 'vitest';
import { parse } from './mock';
import { types as t } from '@babel/core';
import type { TextUnit } from '../index';

describe('TextUnit', () => {
  // ---- Type
  it('should identify text unit', () => {
    const viewUnits = parse('<>hello world</>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('text');
  });

  it('should identify text unit with boolean expression', () => {
    const viewUnits = parse('<>{true}</>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('text');
  });

  it('should identify text unit with number expression', () => {
    const viewUnits = parse('<>{1}</>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('text');
  });

  it('should identify text unit with null expression', () => {
    const viewUnits = parse('<>{null}</>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('text');
  });

  it('should identify text unit with string literal expression', () => {
    const viewUnits = parse('<>{"hello world"}</>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('text');
  });

  // ---- Content
  it('should correctly parse content for text unit', () => {
    const viewUnits = parse('<>hello world</>');
    const content = (viewUnits[0] as TextUnit).content;

    expect(t.isStringLiteral(content, { value: 'hello world' })).toBeTruthy();
  });

  it('should correctly parse content for boolean text unit', () => {
    const viewUnits = parse('<>{true}</>');
    const content = (viewUnits[0] as TextUnit).content;

    expect(t.isBooleanLiteral(content, { value: true })).toBeTruthy();
  });

  it('should correctly parse content for number text unit', () => {
    const viewUnits = parse('<>{1}</>');
    const content = (viewUnits[0] as TextUnit).content;

    expect(t.isNumericLiteral(content, { value: 1 })).toBeTruthy();
  });

  it('should correctly parse content for null text unit', () => {
    const viewUnits = parse('<>{null}</>');
    const content = (viewUnits[0] as TextUnit).content;

    expect(t.isNullLiteral(content)).toBeTruthy();
  });

  it('should correctly parse content for string literal text unit', () => {
    const viewUnits = parse('<>{"hello world"}</>');
    const content = (viewUnits[0] as TextUnit).content;

    expect(t.isStringLiteral(content)).toBeTruthy();
  });
});
