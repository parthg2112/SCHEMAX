import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const connectionString = process.env.DATABASE_URL;
console.log("Testing PostgreSQL connection...");
console.log("Connection string:", connectionString?.replace(/sk_[^@]+/, "sk_***"));
const pool = new Pool({
    connectionString,
    ssl: connectionString?.includes('prisma.io') ? { rejectUnauthorized: false } : undefined,
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
    console.log("Database connection successful!");
    console.log("Current time from DB:", res.rows[0]);
    // Test table exists
    pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'", (err2, res2) => {
        if (err2) {
            console.error("Error listing tables:", err2);
        }
        else {
            console.log("Tables in database:", res2.rows);
        }
        pool.end();
    });
});
