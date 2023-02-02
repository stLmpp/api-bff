import { z } from 'zod';

export const caching_data_schema = z.object({
  date: z.number(),
  value: z.any(),
});

export type CachingData = z.infer<typeof caching_data_schema>;
