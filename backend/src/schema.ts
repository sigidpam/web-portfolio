// backend/src/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. Work Experience (Content)
export const experience = sqliteTable('experience', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company: text('company').notNull(),
  title: text('title').notNull(),
  period: text('period').notNull(),
  description: text('description').notNull(),
});

// 2. Gated CV Downloads (Leads)
export const pdfDownloads = sqliteTable('pdf_downloads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  downloadedAt: integer('downloaded_at', { mode: 'timestamp' }).notNull(),
});

// 3. Client Inquiries (Contact Form)
export const inquiries = sqliteTable('inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
});

// 4. Page Views (Basic Analytics)
export const visitors = sqliteTable('visitors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull(),
  userAgent: text('user_agent'),
  visitedAt: integer('visited_at', { mode: 'timestamp' }).notNull(),
});
