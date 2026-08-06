import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('returns normalized environment values', () => {
    expect(
      validateEnv({
        API_CORS_ORIGIN: 'http://localhost:4200',
        API_PORT: '3000',
        DATABASE_URL: 'postgresql://cadeboard:secret@localhost:5432/cadeboard',
        NODE_ENV: 'test',
      }),
    ).toEqual({
      API_CORS_ORIGIN: 'http://localhost:4200',
      API_PORT: 3000,
      DATABASE_URL: 'postgresql://cadeboard:secret@localhost:5432/cadeboard',
      NODE_ENV: 'test',
    });
  });

  it('fails when a required variable is absent', () => {
    expect(() =>
      validateEnv({
        API_CORS_ORIGIN: 'http://localhost:4200',
        DATABASE_URL: 'postgresql://cadeboard:secret@localhost:5432/cadeboard',
      }),
    ).toThrow('API_PORT is required');
  });
});
