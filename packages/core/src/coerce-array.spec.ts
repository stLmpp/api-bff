import { coerceArray } from './coerce-array.js';

describe('coerce-array', () => {
  it('should coerce non-array to array', () => {
    expect(coerceArray({})).toEqual([{}]);
    expect(coerceArray(1)).toEqual([1]);
    expect(coerceArray('')).toEqual(['']);
  });

  it('should work with array', () => {
    expect(coerceArray([])).toEqual([]);
    expect(coerceArray([1])).toEqual([1]);
  });
});
