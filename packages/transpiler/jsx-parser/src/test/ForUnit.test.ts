import { describe, expect, it } from 'vitest';
import { parse } from './mock';


describe('ForUnit', () => {
  it('should identify for unit', () => {
    const viewUnits = parse('<for array={items} item={item}> <div>{item}</div> </for>');
    expect(viewUnits.length).toBe(1);
    expect(viewUnits[0].type).toBe('for');
  });
});