import {
  handleMutualBindDirective,
} from '../../../../src/next/convert/jsx/directives.js';

describe('handleMutualBindDirective', () => {
  it('should replace attribute with mutual bind', () => {
    const path = {node: {attributes: []}};
    const value = 'message';
    handleMutualBindDirective(path, value);
    expect(path.node.attributes).toHaveLength(2);
    expect(path.node.attributes[0].name.name).toBe(value);
    expect(path.node.attributes[1].name.name).toBe('update_' + value);
  });
});

