import { fixed } from './fixed.js';

describe('fixed', () => {
  it('should return a function with the value encapsulated', () => {
    const value = {};
    const fn = fixed(value);
    expect(typeof fn).toBe('function');
    expect(fn()).toBe(value);
  });
});
