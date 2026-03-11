import prisma from '../prisma';

describe('Prisma Client', () => {
  it('should instantiate PrismaClient successfully', () => {
    // PrismaClient is usually instantiated once and reused.
    // This test primarily checks if the import and instantiation works.
    expect(prisma).toBeDefined();
    // For a greenfield, ensuring it's an object is a good start.
    expect(typeof prisma).toBe('object');
  });
});
