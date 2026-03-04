import "server-only";

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const connectionString =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string is not configured");
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

export default db; 
