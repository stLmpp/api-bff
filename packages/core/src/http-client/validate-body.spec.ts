import { validateBody } from './validate-body.js';

describe('validate-body', () => {
  it('should return null if body is null or undefined', () => {
    expect(validateBody(null)).toBeNull();
    expect(validateBody(undefined)).toBeNull();
  });

  it('should return string if body is Buffer', () => {
    const buffer = Buffer.from('{}');
    expect(validateBody(buffer)).toBe('{}');
  });

  it('should return string if body is a valid JSON string', () => {
    expect(validateBody('[]')).toBe('[]');
  });

  it('should return null if body is an invalid JSON string', () => {
    expect(validateBody('{ invalid json string ]')).toBeNull();
  });

  it('should return string if body is not a string', () => {
    expect(validateBody([{ id: 1 }])).toBe('[{"id":1}]');
  });

  it('should return null if JSON.parse throws', () => {
    const obj: Record<string, unknown> = {};
    obj.obj = obj;
    expect(validateBody(obj)).toBeNull();
  });
});
