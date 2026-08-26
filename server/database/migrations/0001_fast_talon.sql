CREATE TABLE `merch_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`price_cents` integer NOT NULL,
	`image_url` text,
	`sizes` text,
	`stock_qty` integer,
	`external_url` text,
	`available_in_person` integer DEFAULT true NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_by_user_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `merch_published_idx` ON `merch_items` (`published`,`sort_order`);