import { neon } from '@neondatabase/serverless';
import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;

if (!connectionString) {
  throw new Error('Database connection string is not configured');
}

const sql = neon(connectionString);

async function runMigration() {
  try {
    console.log('Reading migration file...');
    // Read SQL file manually and execute it
    const migrationPath = join(process.cwd(), 'drizzle', '0000_free_squirrel_girl.sql');
    const migrationSQL = await readFile(migrationPath, 'utf8');
    
    console.log('Executing SQL migration...');
    console.log('SQL:', migrationSQL);
    
    const result = await sql(migrationSQL);
    console.log('Migration successful:', result);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration(); 
