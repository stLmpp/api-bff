import { uniq } from './uniq.js';

describe('uniq', () => {
  it('should return uniq values from array', () => {
    expect(uniq([1, 2, 3, 3, 5])).toEqual([1, 2, 3, 5]);
  });
});
