/**
 * @public
 * @param path
 */
export function env(path: string): () => string | undefined {
  return () => process.env[path];
}
