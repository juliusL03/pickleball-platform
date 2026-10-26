import { AppResolver } from '../src/app.resolver';

describe('AppResolver', () => {
  it('returns ok', () => {
    const resolver = new AppResolver();
    expect(resolver.hello()).toBe('Pickleball API');
  });
});
