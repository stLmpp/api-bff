import { z } from 'zod';

export const CachingDataSchema = z.object({
  date: z.number(),
  value: z.any(),
});

export type CachingData = z.infer<typeof CachingDataSchema>;
