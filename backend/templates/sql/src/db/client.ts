import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL!;

export const pool = new Pool({
    connectionString,
});

export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};
