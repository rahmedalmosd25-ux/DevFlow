import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create adapter for PrismaClient with connection pooling
const pool = new Pool({
  connectionString,
  max: 20, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // Send keepalive after 10 seconds of inactivity
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const adapter = new PrismaPg(pool);

// Export datasource configuration for Prisma Migrate
export default {
  datasource: {
    url: connectionString,
  },
};