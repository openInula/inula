import { resolveMutation } from '../../../../libs/inula/src/inulax/CommonUtils';

describe('Mutation resolve', () => {
  it('should resolve mutation different types', () => {
    const mutation = resolveMutation(null, 42);

    expect(mutation.mutation).toBe(true);
    expect(mutation.from).toBe(null);
    expect(mutation.to).toBe(42);
  });

  it('should resolve mutation same type types, different values', () => {
    const mutation = resolveMutation(13, 42);

    expect(mutation.mutation).toBe(true);
    expect(mutation.from).toBe(13);
    expect(mutation.to).toBe(42);
  });

  it('should resolve mutation same type types, same values', () => {
    const mutation = resolveMutation(42, 42);

    expect(mutation.mutation).toBe(false);
    expect(Object.keys(mutation).length).toBe(1);
  });

  it('should resolve mutation same type types, same objects', () => {
    const mutation = resolveMutation({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } });

    expect(mutation.mutation).toBe(false);
  });

  it('should resolve mutation same type types, same array', () => {
    const mutation = resolveMutation([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);

    expect(mutation.mutation).toBe(false);
  });

  it('should resolve mutation same type types, longer array', () => {
    const mutation = resolveMutation([1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6]);

    expect(mutation.mutation).toBe(true);
    expect(mutation.items[5].mutation).toBe(true);
    expect(mutation.items[5].to).toBe(6);
  });

  it('should resolve mutation same type types, shorter array', () => {
    const mutation = resolveMutation([1, 2, 3, 4, 5], [1, 2, 3, 4]);

    expect(mutation.mutation).toBe(true);
    expect(mutation.items[4].mutation).toBe(true);
    expect(mutation.items[4].from).toBe(5);
  });

  it('should resolve mutation same type types, changed array', () => {
    const mutation = resolveMutation([1, 2, 3, 4, 5], [1, 2, 3, 4, 'a']);

    expect(mutation.mutation).toBe(true);
    expect(mutation.items[4].mutation).toBe(true);
    expect(mutation.items[4].from).toBe(5);
    expect(mutation.items[4].to).toBe('a');
  });

  it('should resolve mutation same type types, same object', () => {
    const mutation = resolveMutation({ a: 1, b: 2 }, { a: 1, b: 2 });

    expect(mutation.mutation).toBe(false);
  });

  it('should resolve mutation same type types, changed object', () => {
    const mutation = resolveMutation({ a: 1, b: 2, c: 3 }, { a: 1, c: 2 });

    expect(mutation.mutation).toBe(true);
    expect(mutation.attributes.a.mutation).toBe(false);
    expect(mutation.attributes.b.mutation).toBe(true);
    expect(mutation.attributes.b.from).toBe(2);
    expect(mutation.attributes.c.to).toBe(2);
  });
});

describe('Mutation collections', () => {
  it('should resolve mutation of two sets', () => {
    const values = [{ a: 1 }, { b: 2 }, { c: 3 }];

    const source = new Set([values[0], values[1], values[2]]);

    const target = new Set([values[0], values[1]]);

    const mutation = resolveMutation(source, target);

    expect(mutation.mutation).toBe(true);
  });
});
