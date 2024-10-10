import { describe, expect, it } from 'vitest';
import { parse } from './mock';
import { types as t } from '@babel/core';
import type { HTMLUnit, TemplateUnit } from '../index';

describe('TemplateUnit', () => {
  // ---- Type
  it('should not parse a single HTMLUnit to a TemplateUnit', () => {
    const viewUnits = parse('<div></div>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('html');
  });

  it('should parse a nested HTMLUnit to a TemplateUnit', () => {
    const viewUnits = parse('<div><div></div></div>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('template');
  });

  it('should correctly parse a nested HTMLUnit\'s structure into a template', () => {
    const viewUnits = parse('<div><div></div></div>');
    const template = (viewUnits[0] as TemplateUnit).template;

    expect(t.isStringLiteral(template.tag, { value: 'div' })).toBeTruthy();
    expect(template.children).toHaveLength(1);
    const firstChild = template.children![0] as HTMLUnit;
    expect(t.isStringLiteral(firstChild.tag, { value: 'div' })).toBeTruthy();
  });

  // ---- Props
  it('should correctly parse the path of TemplateUnit\'s dynamic props in root element', () => {
    const viewUnits = parse('<div class={this.name}><div></div></div>');
    const dynamicProps = (viewUnits[0] as TemplateUnit).props;

    expect(dynamicProps).toHaveLength(1);
    const prop = dynamicProps[0];
    expect(prop.path).toHaveLength(0);
  });

  it('should correctly parse the path of TemplateUnit\'s dynamic props in nested element', () => {
    const viewUnits = parse('<div><div class={this.name}></div></div>');
    const dynamicProps = (viewUnits[0] as TemplateUnit).props!;

    expect(dynamicProps).toHaveLength(1);
    const prop = dynamicProps[0]!;
    expect(prop.path).toHaveLength(1);
    expect(prop.path[0]).toBe(0);
  });

  it('should correctly parse the path of TemplateUnit\'s dynamic props with mutable particles ahead', () => {
    const viewUnits = parse('<div><Comp/><div class={this.name}></div></div>');
    const dynamicProps = (viewUnits[0] as TemplateUnit).props!;

    expect(dynamicProps).toHaveLength(1);
    const prop = dynamicProps[0]!;
    expect(prop.path).toHaveLength(1);
    expect(prop.path[0]).toBe(0);
  });

  it('should correctly parse the path of TemplateUnit\'s mutableUnits', () => {
    const viewUnits = parse('<div><Comp/><div class={this.name}></div></div>');
    const mutableParticles = (viewUnits[0] as TemplateUnit).mutableUnits!;

    expect(mutableParticles).toHaveLength(1);
    const particle = mutableParticles[0]!;
    expect(particle.path).toHaveLength(1);
    expect(particle.path[0]).toBe(0);
  });

  it('should correctly parse the path of multiple TemplateUnit\'s mutableUnits', () => {
    const viewUnits = parse('<div><Comp/><div class={this.name}></div><Comp/></div>');
    const mutableParticles = (viewUnits[0] as TemplateUnit).mutableUnits!;

    expect(mutableParticles).toHaveLength(2);
    const firstParticle = mutableParticles[0]!;
    expect(firstParticle.path).toHaveLength(1);
    expect(firstParticle.path[0]).toBe(0);
    const secondParticle = mutableParticles[1]!;
    expect(secondParticle.path).toHaveLength(1);
    expect(secondParticle.path[0]).toBe(-1);
  });
});
