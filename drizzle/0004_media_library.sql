CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"kind" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text DEFAULT '' NOT NULL,
	"focal_x" integer DEFAULT 50 NOT NULL,
	"focal_y" integer DEFAULT 50 NOT NULL,
	"blur_data_url" text,
	"original_name" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'library' NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_status_created_idx" ON "media" USING btree ("status","created_at");