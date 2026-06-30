import { z } from "zod";

/**
 * Single source of truth for API response shapes. Normalizes the previously
 * inconsistent envelopes ({success,data,pagination} vs bare {data} vs
 * {error}/{message}) into exactly two shapes:
 *   success → { success: true, data, pagination? }
 *   error   → { error, code? }
 *
 * NOTE: this directory is duplicated verbatim in the client repo
 * (client/src/contract). Keep the two copies byte-identical — server is the
 * authority.
 */

export const paginationSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: Pagination;
}

/** Build a normalized success envelope. */
export function ok<T>(data: T, pagination?: Pagination): ApiSuccess<T> {
  return pagination ? { success: true, data, pagination } : { success: true, data };
}

/** Build a normalized error envelope. */
export function err(error: string, code?: string): ApiError {
  return code ? { error, code } : { error };
}
