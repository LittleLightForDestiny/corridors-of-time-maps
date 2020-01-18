import { BungieAuthMiddleware } from './bungie-auth.middleware';

describe('BungieAuthMiddleware', () => {
  it('should be defined', () => {
    expect(new BungieAuthMiddleware()).toBeDefined();
  });
});
