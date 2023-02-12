import { type ParameterObject } from 'openapi3-ts';
import { z } from 'zod';

import { get_parameters } from './get-parameters.js';
import { schema } from './schema.js';

describe('get-parameters', () => {
  it('should get parameters from mapping', () => {
    const parameters = get_parameters({
      path: '',
      host: '',
      request: {
        mapping: {
          body: {},
          params: {
            id: 'id',
          },
          query: {
            id: 'id',
          },
          headers: {
            'x-id': 'x-id',
          },
        },
      },
    });
    const expected: ParameterObject[] = [
      { in: 'path', name: 'id', schema: { type: 'string' } },
      { in: 'query', name: 'id', schema: { type: 'string' } },
      { in: 'header', name: 'x-id', schema: { type: 'string' } },
    ];
    expect(parameters).toEqual(expected);
  });

  it('should get parameters from validation', () => {
    const parameters = get_parameters({
      path: '',
      host: '',
      request: {
        validation: {
          body: z.object({}),
          params: z.object({
            id: schema(z.string(), { description: 'Path id' }),
          }),
          query: z.object({
            id: schema(z.string(), { description: 'Query id' }),
          }),
          headers: z.object({
            'x-id': schema(z.string().optional(), { description: 'Header id' }),
          }),
        },
      },
    });
    const expected: ParameterObject[] = [
      {
        in: 'path',
        name: 'id',
        schema: { type: 'string', description: 'Path id' },
        required: true,
        description: 'Path id',
      },
      {
        in: 'query',
        name: 'id',
        schema: { type: 'string', description: 'Query id' },
        required: true,
        description: 'Query id',
      },
      {
        in: 'header',
        name: 'x-id',
        schema: { type: 'string', description: 'Header id' },
        required: false,
        description: 'Header id',
      },
    ];
    expect(parameters).toEqual(expected);
  });

  it('should prioritize validation over mapping', () => {
    const parameters = get_parameters({
      host: '',
      path: '',
      request: {
        mapping: {
          params: {
            id: 'id',
          },
        },
        validation: {
          params: z.object({
            id: z.string().max(15),
          }),
        },
      },
    });
    const expected: ParameterObject[] = [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', maxLength: 15 },
      },
    ];
    expect(parameters).toEqual(expected);
  });

  it('should not get parameters from function mapping', () => {
    const parameters = get_parameters({
      host: '',
      path: '',
      request: {
        mapping: {
          params: () => ({}),
        },
      },
    });
    expect(parameters).toEqual([]);
  });
});
