// Generated Drizzle ORM Schema
// This file will be populated by the AI schema generator
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
// Example table - will be replaced by generated schema
export const exampleTable = pgTable('example', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
