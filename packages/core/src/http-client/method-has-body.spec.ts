import { method_has_body } from './method-has-body.js';

describe('method-has-body', () => {
  it('should return if http method has body', () => {
    expect(method_has_body('GET')).toBe(false);
    expect(method_has_body('DELETE')).toBe(false);
    expect(method_has_body('POST')).toBe(true);
    expect(method_has_body('PUT')).toBe(true);
    expect(method_has_body('PATCH')).toBe(true);
  });
});
