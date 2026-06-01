CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	`is_read` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`user_agent` text,
	`visited_at` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `experience` DROP COLUMN `location`;