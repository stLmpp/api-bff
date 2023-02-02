import { type Method } from '../method.schema.js';

export function method_has_body(method: Method): boolean {
  return !['GET', 'DELETE'].includes(method);
}
