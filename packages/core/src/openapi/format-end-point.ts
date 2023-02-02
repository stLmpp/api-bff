export function format_end_point_openapi(path: string): string {
  return path
    .split('/')
    .map((item) => {
      if (!item.startsWith(':')) {
        return item;
      }
      return `{${item.replace(/^:/, '')}}`;
    })
    .join('/');
}
