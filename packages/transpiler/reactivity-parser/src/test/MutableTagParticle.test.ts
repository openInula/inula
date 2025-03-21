import { expect, describe, it } from 'vitest';
import { parse } from './mock';
import { type HTMLParticle, type ExpParticle, type CompParticle } from '../types';
import { type types as t } from '@babel/core';

describe('MutableTagParticle', () => {
  // ---- HTML
  it('should parse an HTMLUnit with dynamic tag as an HTMLParticle', () => {
    const viewParticles = parse('tag(div)()');
    expect(viewParticles.length).toBe(1);
    expect(viewParticles[0].type).toBe('html');
  });

  it('should parse an HTMLUnit with no children as an HTMLParticle', () => {
    const viewParticles = parse('div()');
    expect(viewParticles.length).toBe(1);
    expect(viewParticles[0].type).toBe('html');
  });

  it('should parse an HTMLUnit with non-static-html children as an HTMLParticle', () => {
    const viewParticles = parse('div(); { Comp(); tag(div)(); }');
    expect(viewParticles.length).toBe(1);
    expect(viewParticles[0].type).toBe('html');
  });

  it('should not parse an HTMLUnit with potential TemplateUnit as an HTMLParticle', () => {
    const viewParticles = parse('div(); { div() }');
    expect(viewParticles.length).toBe(1);
    expect(viewParticles[0].type).not.toBe('html');
  });

  it('should parse an HTMLUnit with dynamic tag with dependencies as an ExpParticle', () => {
    const viewParticles = parse('tag(flag)()');
    expect(viewParticles.length).toBe(1);
    expect(viewParticles[0].type).toBe('exp');
    const content = (viewParticles[0] as ExpParticle).content;

    expect((content.value as t.StringLiteral).value).toBe(Object.keys(content.viewPropMap!)[0]);
    const htmlParticle = content.viewPropMap![Object.keys(content.viewPropMap!)[0]][0] as HTMLParticle;
    expect(htmlParticle.type).toBe('html');
  });

  // ---- Comp
  it('should parse a CompUnit with dynamic tag as an HTMLParticle', () => {
    const viewParticles = parse('Comp()');
    expect(viewParticles.length).toBe(1);
    expect(viewParticles[0].type).toBe('comp');
  });

  it('should parse a CompUnit with dynamic tag with dependencies as an ExpParticle', () => {
    const viewParticles = parse('comp(CompList[flag])()');
    expect(viewParticles.length).toBe(1);
    expect(viewParticles[0].type).toBe('exp');
    const content = (viewParticles[0] as ExpParticle).content;

    expect((content.value as t.StringLiteral).value).toBe(Object.keys(content.viewPropMap!)[0]);
    const compParticle = content.viewPropMap![Object.keys(content.viewPropMap!)[0]][0] as CompParticle;

    expect(compParticle.type).toBe('comp');
  });

  // ---- Snippet
  it('should parse a SnippetUnit as an HTMLParticle', () => {
    const viewParticles = parse('MySnippet()');
    expect(viewParticles.length).toBe(1);
    expect(viewParticles[0].type).toBe('snippet');
  });
});
