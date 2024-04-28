import { expect, describe, it } from 'vitest';
import { availableProperties, parse, reactivityConfig } from './mock';
import { type CompParticle } from '../types';

describe('Dependency', () => {
  it('should parse the correct dependency', () => {
    const viewParticles = parse('Comp(flag)');
    const content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toContain(0);
  });

  it('should parse the correct dependency when interfacing the dependency chain', () => {
    const viewParticles = parse('Comp(doubleCount)');
    const content = (viewParticles[0] as CompParticle).props._$content;
    const dependency = content?.dependencyIndexArr;
    // ---- doubleCount depends on count, count depends on flag
    //      so doubleCount depends on flag, count and doubleCount
    expect(dependency).toContain(availableProperties.indexOf('flag'));
    expect(dependency).toContain(availableProperties.indexOf('count'));
    expect(dependency).toContain(availableProperties.indexOf('doubleCount'));
  });

  it('should not parse the dependency if the property is not in the availableProperties', () => {
    const viewParticles = parse('Comp(notExist)');
    const content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toHaveLength(0);
  });

  it('should not parse the dependency if the member expression is in an escaped function', () => {
    let viewParticles = parse('Comp(escape(flag))');
    let content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toHaveLength(0);

    viewParticles = parse('Comp($(flag))');
    content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toHaveLength(0);
  });

  it('should not parse the dependency if the member expression is in a manual function', () => {
    const viewParticles = parse('Comp(manual(() => count, []))');
    const content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toHaveLength(0);
  });

  it("should parse the dependencies in manual function's second parameter", () => {
    const viewParticles = parse('Comp(manual(() => {let a = count}, [flag]))');
    const content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toHaveLength(1);
  });

  it('should not parse the dependency if the member expression is the left side of an assignment expression', () => {
    const viewParticles = parse('Comp(flag = 1)');
    const content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toHaveLength(0);
  });

  it('should not parse the dependency if the member expression is right side of an assignment expression', () => {
    const viewParticles = parse('Comp(flag = flag + 1)');
    const content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toHaveLength(0);
  });

  it('should parse the dependency as identifiers', () => {
    reactivityConfig.dependencyParseType = 'identifier';
    const viewParticles = parse('Comp(flag + count)');
    const content = (viewParticles[0] as CompParticle).props._$content;
    expect(content?.dependencyIndexArr).toContain(availableProperties.indexOf('flag'));
    expect(content?.dependencyIndexArr).toContain(availableProperties.indexOf('count'));
    reactivityConfig.dependencyParseType = 'property';
  });
});
