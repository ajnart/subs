CREATE TABLE `shawty_subscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`url` text(2048) NOT NULL,
	`price` integer NOT NULL,
	`icon` text(2048) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `shawty_subscription` (`name`);