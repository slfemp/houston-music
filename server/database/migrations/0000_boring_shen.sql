CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'checking' NOT NULL,
	`institution` text,
	`last_four` text,
	`opening_balance_cents` integer DEFAULT 0 NOT NULL,
	`restricted_purpose` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `agenda_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer NOT NULL,
	`position` integer NOT NULL,
	`item_number` text,
	`kind` text DEFAULT 'new_business' NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`issue_id` integer,
	`presenter_user_id` integer,
	`minutes_allotted` integer,
	`action_required` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`presenter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `agenda_meeting_idx` ON `agenda_items` (`meeting_id`,`position`);--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer NOT NULL,
	`member_id` integer NOT NULL,
	`status` text DEFAULT 'absent' NOT NULL,
	`arrived_at` integer,
	`departed_at` integer,
	`note` text,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_unique` ON `attendance` (`meeting_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` integer,
	`detail` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_log` (`entity`,`entity_id`);--> statement-breakpoint
CREATE TABLE `budget_lines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fiscal_year` integer NOT NULL,
	`category` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`kind` text DEFAULT 'expense' NOT NULL,
	`note` text,
	`approved_by_motion_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`approved_by_motion_id`) REFERENCES `motions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `budget_unique` ON `budget_lines` (`fiscal_year`,`category`,`kind`);--> statement-breakpoint
CREATE TABLE `event_rsvps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`response` text NOT NULL,
	`note` text,
	`responded_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_rsvp_unique` ON `event_rsvps` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`visibility` text DEFAULT 'board' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`all_day` integer DEFAULT false NOT NULL,
	`location` text,
	`virtual_url` text,
	`image_url` text,
	`external_rsvp_url` text,
	`rsvp_required` integer DEFAULT false NOT NULL,
	`rsvp_deadline` integer,
	`board_rep_note` text,
	`created_by_user_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `events_starts_idx` ON `events` (`starts_at`);--> statement-breakpoint
CREATE INDEX `events_visibility_idx` ON `events` (`visibility`,`published`);--> statement-breakpoint
CREATE TABLE `issue_support` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`weight` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `issue_support_unique` ON `issue_support` (`issue_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`submitted_by_user_id` integer,
	`submitter_name` text,
	`submitter_email` text,
	`is_public` integer DEFAULT false NOT NULL,
	`resolution_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `issues_status_idx` ON `issues` (`status`);--> statement-breakpoint
CREATE INDEX `issues_category_idx` ON `issues` (`category`);--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`type` text DEFAULT 'regular' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`location` text NOT NULL,
	`virtual_url` text,
	`notice_posted_at` integer,
	`notice_required_hours` integer DEFAULT 72 NOT NULL,
	`seats_at_notice` integer,
	`quorum_required` integer,
	`called_to_order_at` integer,
	`adjourned_at` integer,
	`minutes_body` text,
	`minutes_status` text DEFAULT 'none' NOT NULL,
	`minutes_approved_by_motion_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `meetings_starts_idx` ON `meetings` (`starts_at`);--> statement-breakpoint
CREATE INDEX `meetings_status_idx` ON `meetings` (`status`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`position` text DEFAULT 'member' NOT NULL,
	`organization` text,
	`title` text,
	`bio` text,
	`seat_number` integer,
	`term_start` integer,
	`term_end` integer,
	`seated` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `members_user_idx` ON `members` (`user_id`);--> statement-breakpoint
CREATE INDEX `members_seated_idx` ON `members` (`seated`);--> statement-breakpoint
CREATE TABLE `motions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer NOT NULL,
	`agenda_item_id` integer,
	`parent_motion_id` integer,
	`related_meeting_id` integer,
	`kind` text DEFAULT 'main' NOT NULL,
	`text` text NOT NULL,
	`moved_by_member_id` integer,
	`seconded_by_member_id` integer,
	`threshold` text DEFAULT 'majority' NOT NULL,
	`method` text DEFAULT 'roll_call' NOT NULL,
	`status` text DEFAULT 'proposed' NOT NULL,
	`ayes` integer,
	`nays` integer,
	`abstentions` integer,
	`recusals` integer,
	`absent` integer,
	`seats_at_vote` integer,
	`opened_at` integer,
	`closed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agenda_item_id`) REFERENCES `agenda_items`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`moved_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`seconded_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `motions_meeting_idx` ON `motions` (`meeting_id`);--> statement-breakpoint
CREATE INDEX `motions_agenda_idx` ON `motions` (`agenda_item_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer NOT NULL,
	`occurred_on` integer NOT NULL,
	`amount_cents` integer NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`payee` text,
	`memo` text,
	`reference` text,
	`transfer_group` text,
	`receipt_url` text,
	`approved_by_motion_id` integer,
	`entered_by_user_id` integer,
	`reconciled_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`approved_by_motion_id`) REFERENCES `motions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`entered_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `tx_account_date_idx` ON `transactions` (`account_id`,`occurred_on`);--> statement-breakpoint
CREATE INDEX `tx_category_idx` ON `transactions` (`category`);--> statement-breakpoint
CREATE INDEX `tx_transfer_idx` ON `transactions` (`transfer_group`);--> statement-breakpoint
CREATE TABLE `treasurer_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer,
	`period_start` integer NOT NULL,
	`period_end` integer NOT NULL,
	`opening_balance_cents` integer NOT NULL,
	`income_cents` integer NOT NULL,
	`expense_cents` integer NOT NULL,
	`closing_balance_cents` integer NOT NULL,
	`narrative` text,
	`prepared_by_user_id` integer,
	`accepted_by_motion_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`prepared_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`accepted_by_motion_id`) REFERENCES `motions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `treas_meeting_idx` ON `treasurer_reports` (`meeting_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `volunteer_opportunities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`location` text,
	`starts_at` integer,
	`ends_at` integer,
	`slots` integer,
	`skills_wanted` text,
	`contact_email` text,
	`published` integer DEFAULT false NOT NULL,
	`closes_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vol_opps_published_idx` ON `volunteer_opportunities` (`published`,`starts_at`);--> statement-breakpoint
CREATE TABLE `volunteer_signups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`opportunity_id` integer NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`organization` text,
	`message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`opportunity_id`) REFERENCES `volunteer_opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `signup_unique` ON `volunteer_signups` (`opportunity_id`,`email`);--> statement-breakpoint
CREATE INDEX `signup_opp_idx` ON `volunteer_signups` (`opportunity_id`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`motion_id` integer NOT NULL,
	`member_id` integer NOT NULL,
	`choice` text NOT NULL,
	`reason` text,
	`cast_at` integer NOT NULL,
	FOREIGN KEY (`motion_id`) REFERENCES `motions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `votes_unique` ON `votes` (`motion_id`,`member_id`);