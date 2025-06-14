CREATE TYPE "public"."product_type" AS ENUM('lumber', 'firewood');--> statement-breakpoint
CREATE TYPE "public"."wood_type" AS ENUM('pine', 'larch', 'aspen', 'spruce', 'birch');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "saw_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "thickness" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "width" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "length" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_type" "product_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "wood_type" "wood_type" NOT NULL;