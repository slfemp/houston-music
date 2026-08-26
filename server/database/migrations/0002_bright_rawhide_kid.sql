CREATE TABLE `booking_venues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`neighborhood` text,
	`lat` text,
	`lng` text,
	`venue_type` text DEFAULT 'club' NOT NULL,
	`capacity` integer,
	`genres_booked` text,
	`accepts_submissions` integer DEFAULT false NOT NULL,
	`pays_artists` text DEFAULT 'varies' NOT NULL,
	`booking_contact_name` text,
	`booking_email` text,
	`booking_phone` text,
	`submission_url` text,
	`submission_notes` text,
	`all_ages` integer DEFAULT false NOT NULL,
	`has_backline` integer DEFAULT false NOT NULL,
	`has_sound_engineer` integer DEFAULT false NOT NULL,
	`stage_notes` text,
	`website_url` text,
	`social_url` text,
	`published` integer DEFAULT false NOT NULL,
	`verified_at` integer,
	`verified_by_user_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `venues_published_idx` ON `booking_venues` (`published`,`name`);--> statement-breakpoint
CREATE INDEX `venues_type_idx` ON `booking_venues` (`venue_type`);--> statement-breakpoint
CREATE TABLE `musicians` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`stage_name` text,
	`email` text NOT NULL,
	`phone` text,
	`act_type` text DEFAULT 'solo' NOT NULL,
	`genres` text,
	`neighborhood` text,
	`bio` text,
	`years_active` integer,
	`member_count` integer,
	`website_url` text,
	`streaming_url` text,
	`social_url` text,
	`press_kit_url` text,
	`looking_for` text,
	`available_for_booking` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`listed` integer DEFAULT true NOT NULL,
	`review_note` text,
	`reviewed_by_user_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `musicians_email_idx` ON `musicians` (`email`);--> statement-breakpoint
CREATE INDEX `musicians_status_idx` ON `musicians` (`status`,`listed`);