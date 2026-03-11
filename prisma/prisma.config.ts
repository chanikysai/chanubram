import { defineConfig } from 'prisma';

export default defineConfig((env) => ({
  datasources: {
    db: {
      url: env('DATABASE_URL', process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dev_db'),
    },
  },
}));
