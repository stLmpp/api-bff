import { type Method } from '../method.schema.js';

export function methodHasBody(method: Method): boolean {
  return !['GET', 'DELETE'].includes(method);
}
