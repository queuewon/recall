CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`content` text NOT NULL,
	`submitted_at` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `concepts` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`term` text NOT NULL,
	`explanation` text NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`answer_id` text PRIMARY KEY NOT NULL,
	`score` integer NOT NULL,
	`issues` text NOT NULL,
	`comment` text NOT NULL,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`title` text NOT NULL,
	`content_markdown` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`options` text,
	`correct_index` integer,
	`concept_id` text,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`concept_id`) REFERENCES `concepts`(`id`) ON UPDATE no action ON DELETE no action
);
