import { describe, expect, it } from 'vitest';
import { parse } from './mock';

describe('ForUnit', () => {
  it('should identify for unit', () => {
    const viewUnits = parse('<for each={items}>{([x, y, z], idx) => <Comp$1 x={x} y={y} z={z} idx={idx}/>}</for>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('for');
  });
});
