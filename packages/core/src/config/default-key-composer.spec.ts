import { defaultKeyComposer } from './default-key-composer.js';

describe('default-key-composer', () => {
  it('should compose a caching key', () => {
    expect(
      defaultKeyComposer({
        url: new URL('teste', 'https://localhost'),
        params: { idParam: '1' },
        body: {},
        query: { idQuery: '2' },
        headers: { idHeader: '3' },
        method: 'GET',
      })
    ).toBe('GET__https://localhost/teste');
  });
});
