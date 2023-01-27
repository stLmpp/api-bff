import { forward } from './forward.js';

describe('forward', () => {
  it('should return a function that return its first argument', () => {
    const fn = forward<string>();
    expect(typeof fn).toBe('function');
    expect(fn('teste')).toBe('teste');
  });
});
