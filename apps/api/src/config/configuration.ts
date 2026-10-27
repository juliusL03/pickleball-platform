function parseCorsOrigins(origin?: string): string | string[] {
  if (!origin) {
    return ['http://localhost:3000', 'http://localhost:3002'];
  }
  const origins = origin
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
  if (origins.length === 0) {
    return ['http://localhost:3000', 'http://localhost:3002'];
  }
  return origins;
}

export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pickleball',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
  },
});
