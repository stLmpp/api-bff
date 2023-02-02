import { type Request } from 'express';

import { type ApiConfigRequestMappingParams } from './api-config/api-config.schema.js';

export async function map_request_params(
  mapping: ApiConfigRequestMappingParams,
  data: Record<string, string>,
  req: Request
): Promise<Record<string, string>> {
  if (typeof mapping === 'function') {
    return mapping(data, req);
  }
  const final_result: Record<string, string> = {};
  const promises: Promise<void>[] = [];
  for (const [key, value] of Object.entries(mapping)) {
    const data_value = data[key];
    if (typeof value === 'function') {
      promises.push(
        Promise.resolve(value(data_value, req)).then((mapped_value) => {
          final_result[key] = mapped_value;
        })
      );
    } else {
      final_result[key] = data_value;
    }
  }
  await Promise.all(promises);
  return final_result;
}
