import { HealthController } from '../src/health/health.controller';

describe('Health (unit)', () => {
  it('returns ok with connected db', () => {
    const controller = new HealthController({ readyState: 1 } as any);
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(result.timestamp).toBeDefined();
  });

  it('returns disconnected when not connected', () => {
    const controller = new HealthController({ readyState: 0 } as any);
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('disconnected');
  });
});
