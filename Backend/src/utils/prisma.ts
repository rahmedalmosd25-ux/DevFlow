import { PrismaClient } from '../../generated/prisma/client.js';
import { adapter } from '../../prisma.config.js';

// Create PrismaClient instance with the adapter
export const prisma = new PrismaClient({
  adapter: adapter,
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

