type Env = Record<string, string | undefined>;

function required(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function validateEnv(config: Env) {
  return {
    NODE_ENV: config.NODE_ENV ?? 'development',
    PORT: Number(config.PORT ?? 3000),
    APP_NAME: config.APP_NAME ?? 'Ordinis API',
    APP_ORIGIN: config.APP_ORIGIN ?? 'http://localhost:5173',
    DATABASE_URL: required(config.DATABASE_URL, 'DATABASE_URL'),
    JWT_ACCESS_SECRET: required(config.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
    JWT_ACCESS_TTL: config.JWT_ACCESS_TTL ?? '15m',
    JWT_REFRESH_SECRET: required(
      config.JWT_REFRESH_SECRET,
      'JWT_REFRESH_SECRET',
    ),
    JWT_REFRESH_TTL: config.JWT_REFRESH_TTL ?? '30d',
    UPLOAD_DIR: config.UPLOAD_DIR ?? './storage',
  };
}
