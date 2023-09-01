import { parsePath } from '../../../../src/utils/dataUtils/getJSONByFormData';

describe('parsePath function', () => {
  it('should parse path correctly', () => {
    expect(parsePath('users[0].name')).toEqual(['users', '0', 'name']);
    expect(parsePath('books[2][title]')).toEqual(['books', '2', 'title']);
    expect(parsePath('')).toEqual([]);
    expect(parsePath('property')).toEqual(['property']);
  });
});
