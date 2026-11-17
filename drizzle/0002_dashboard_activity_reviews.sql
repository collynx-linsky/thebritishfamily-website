CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"summary" text NOT NULL,
	"href" text
);
--> statement-breakpoint
CREATE TABLE "content_reviews" (
	"key" text PRIMARY KEY NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_by" integer
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "onboarded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content_history" ADD COLUMN "saved_by" integer;--> statement-breakpoint
ALTER TABLE "content_history" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_reviewed_by_admin_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_at_idx" ON "activity_log" USING btree ("at");--> statement-breakpoint
ALTER TABLE "content_history" ADD CONSTRAINT "content_history_saved_by_admin_users_id_fk" FOREIGN KEY ("saved_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;