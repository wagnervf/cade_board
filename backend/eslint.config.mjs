import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        beforeAll: 'readonly',
        console: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        process: 'readonly',
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['prisma.config.ts', 'prisma/seed.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.spec.ts'],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        beforeAll: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
      },
    },
  },
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'jest.config.cjs',
      'jest.integration.config.cjs',
    ],
  },
);
