import { coerce_array } from './coerce-array.js';

describe('coerce-array', () => {
  it('should coerce non-array to array', () => {
    expect(coerce_array({})).toEqual([{}]);
    expect(coerce_array(1)).toEqual([1]);
    expect(coerce_array('')).toEqual(['']);
  });

  it('should work with array', () => {
    expect(coerce_array([])).toEqual([]);
    expect(coerce_array([1])).toEqual([1]);
  });
});
