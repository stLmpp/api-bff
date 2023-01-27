import { type Method } from '../method.schema.js';

export function methodHasBody(method: Method) {
  return !['GET', 'DELETE'].includes(method);
}
