import { methodHasBody } from './method-has-body.js';

describe('method-has-body', () => {
  it('should return if http method has body', () => {
    expect(methodHasBody('GET')).toBe(false);
    expect(methodHasBody('DELETE')).toBe(false);
    expect(methodHasBody('POST')).toBe(true);
    expect(methodHasBody('PUT')).toBe(true);
    expect(methodHasBody('PATCH')).toBe(true);
  });
});
