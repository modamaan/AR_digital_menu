
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error(
        'DATABASE_URL is not defined. Please add it to your .env.local file.\n' +
        'Get your connection string from: https://console.neon.tech'
    );
}

// Create NeonDB client
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle instance with schema
export const db = drizzle(sql, { schema });

// Export schema for use in queries
export { schema };
