import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Table for Work Experience
export const experience = sqliteTable('experience', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company: text('company').notNull(), 
  title: text('title').notNull(),
  period: text('period').notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(), // Stores markdown or HTML for bullet points
});

// Table for Projects (Manual entries alongside GitHub API)
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  techStack: text('tech_stack').notNull(),
  description: text('description').notNull(),
});

// Table for tracking gated CV downloads
export const pdfDownloads = sqliteTable('pdf_downloads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  downloadedAt: integer('downloaded_at', { mode: 'timestamp' }).notNull(),
});
