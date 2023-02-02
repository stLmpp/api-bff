import { validate_body } from './validate-body.js';

describe('validate-body', () => {
  it('should return null if body is null or undefined', () => {
    expect(validate_body(null)).toBeNull();
    expect(validate_body(undefined)).toBeNull();
  });

  it('should return string if body is Buffer', () => {
    const buffer = Buffer.from('{}');
    expect(validate_body(buffer)).toBe('{}');
  });

  it('should return string if body is a valid JSON string', () => {
    expect(validate_body('[]')).toBe('[]');
  });

  it('should return null if body is an invalid JSON string', () => {
    expect(validate_body('{ invalid json string ]')).toBeNull();
  });

  it('should return string if body is not a string', () => {
    expect(validate_body([{ id: 1 }])).toBe('[{"id":1}]');
  });

  it('should return null if JSON.parse throws', () => {
    const obj: Record<string, unknown> = {};
    obj.obj = obj;
    expect(validate_body(obj)).toBeNull();
  });
});
