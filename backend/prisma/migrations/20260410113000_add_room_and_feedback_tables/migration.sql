
CREATE TABLE IF NOT EXISTS "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);


CREATE TABLE IF NOT EXISTS "Feedback" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Feedback_booking_id_idx" ON "Feedback"("booking_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Feedback_user_id_idx" ON "Feedback"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Feedback_booking_id_user_id_key" ON "Feedback"("booking_id", "user_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Feedback_user_id_fkey'
  ) THEN
    ALTER TABLE "Feedback"
    ADD CONSTRAINT "Feedback_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
