type NodeEnv = 'development' | 'production' | 'test';

export type ValidatedEnv = {
  API_CORS_ORIGIN: string;
  API_PORT: number;
  DATABASE_URL: string;
  NODE_ENV: NodeEnv;
};

function requiredString(config: Record<string, unknown>, name: string): string {
  const value = config[name];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} is required`);
  }

  return value.trim();
}

function validatePort(value: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT must be an integer between 1 and 65535');
  }

  return port;
}

function validateUrl(value: string, name: string): string {
  try {
    new URL(value);
    return value;
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
}

function validateNodeEnv(value: unknown): NodeEnv {
  if (value === undefined || value === '') {
    return 'development';
  }

  if (value === 'development' || value === 'production' || value === 'test') {
    return value;
  }

  throw new Error('NODE_ENV must be development, production or test');
}

export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
  return {
    API_CORS_ORIGIN: validateUrl(requiredString(config, 'API_CORS_ORIGIN'), 'API_CORS_ORIGIN'),
    API_PORT: validatePort(requiredString(config, 'API_PORT')),
    DATABASE_URL: requiredString(config, 'DATABASE_URL'),
    NODE_ENV: validateNodeEnv(config.NODE_ENV),
  };
}
