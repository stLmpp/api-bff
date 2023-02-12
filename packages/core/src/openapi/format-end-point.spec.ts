import { format_end_point_openapi } from './format-end-point.js';

describe('format-end-point-openapi', () => {
  it('should transform :param to {param}', () => {
    expect(format_end_point_openapi('/test/:param/test')).toBe(
      '/test/{param}/test'
    );
  });
});
