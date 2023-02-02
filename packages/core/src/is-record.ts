export function is_record(object: unknown): object is Record<string, unknown> {
  return !!object && typeof object === 'object';
}
