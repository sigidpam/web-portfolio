CREATE TABLE `experience` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`title` text NOT NULL,
	`period` text NOT NULL,
	`location` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pdf_downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`downloaded_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`tech_stack` text NOT NULL,
	`description` text NOT NULL
);
