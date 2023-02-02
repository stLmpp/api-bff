import { type ApiConfigResponseMapping } from './api-config/api-config.schema.js';
import { is_record } from './is-record.js';

export async function map_response_body(
  mapping: ApiConfigResponseMapping,
  data: unknown
): Promise<unknown> {
  if (typeof mapping === 'function') {
    return mapping(data);
  }
  if (!is_record(data)) {
    return data;
  }
  const final_result: Record<string, unknown> = {};
  const promises: Promise<void>[] = [];
  for (const [key, value] of Object.entries(mapping)) {
    const data_value = data[key];
    if (typeof value === 'function') {
      promises.push(
        Promise.resolve(value(data_value)).then((mapped_value) => {
          if (typeof mapped_value !== 'undefined') {
            final_result[key] = mapped_value;
          }
        })
      );
    } else if (typeof data_value !== 'undefined') {
      final_result[key] = data_value;
    }
  }
  await Promise.all(promises);
  return final_result;
}
