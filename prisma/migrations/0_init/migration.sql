-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('LEETCODE', 'GFG', 'OTHER', 'INTERVIEWBIT');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('HOMEWORK', 'CLASSWORK');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'TEACHER');

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "city_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "batch_name" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" VARCHAR(100) NOT NULL,
    "easy_assigned" INTEGER NOT NULL DEFAULT 0,
    "hard_assigned" INTEGER NOT NULL DEFAULT 0,
    "medium_assigned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" TEXT,
    "google_id" VARCHAR(100),
    "enrollment_id" VARCHAR(100),
    "city_id" INTEGER,
    "batch_id" INTEGER,
    "leetcode_id" VARCHAR(100),
    "gfg_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "refresh_token" TEXT,
    "gfg_total_solved" INTEGER NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3),
    "lc_total_solved" INTEGER NOT NULL DEFAULT 0,
    "github" VARCHAR(100),
    "linkedin" VARCHAR(150),
    "profile_image_url" VARCHAR(500),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'TEACHER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "refresh_token" TEXT,
    "batch_id" INTEGER,
    "city_id" INTEGER,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "topic_name" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "photo_url" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "question_name" VARCHAR(255) NOT NULL,
    "question_link" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'LEETCODE',
    "level" "Level" NOT NULL DEFAULT 'MEDIUM',
    "topic_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "pdf_url" TEXT,
    "description" TEXT,
    "duration_minutes" INTEGER,
    "class_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "class_name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionVisibility" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'HOMEWORK',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "sync_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "student_id" INTEGER NOT NULL,
    "max_streak" INTEGER NOT NULL DEFAULT 0,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "easy_solved" INTEGER NOT NULL DEFAULT 0,
    "hard_solved" INTEGER NOT NULL DEFAULT 0,
    "medium_solved" INTEGER NOT NULL DEFAULT 0,
    "alltime_city_rank" INTEGER NOT NULL DEFAULT 0,
    "alltime_global_rank" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "PasswordResetOTP" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "otp" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '10 minutes'),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PasswordResetOTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_city_name_key" ON "City"("city_name");

-- CreateIndex
CREATE INDEX "idx_city_name_lookup" ON "City"("city_name", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_slug_key" ON "Batch"("slug");

-- CreateIndex
CREATE INDEX "Batch_city_id_idx" ON "Batch"("city_id");

-- CreateIndex
CREATE INDEX "idx_batch_year_city" ON "Batch"("year", "city_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_city_id_year_batch_name_key" ON "Batch"("city_id", "year", "batch_name");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Student_google_id_key" ON "Student"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_enrollment_id_key" ON "Student"("enrollment_id");

-- CreateIndex
CREATE INDEX "Student_city_id_idx" ON "Student"("city_id");

-- CreateIndex
CREATE INDEX "Student_batch_id_idx" ON "Student"("batch_id");

-- CreateIndex
CREATE INDEX "Student_batch_id_city_id_idx" ON "Student"("batch_id", "city_id");

-- CreateIndex
CREATE INDEX "idx_student_batch_city_composite" ON "Student"("batch_id", "city_id", "id");

-- CreateIndex
CREATE INDEX "idx_student_me_optimized" ON "Student"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_city_id_idx" ON "Admin"("city_id");

-- CreateIndex
CREATE INDEX "Admin_batch_id_idx" ON "Admin"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_topic_name_key" ON "Topic"("topic_name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_topic_name_idx" ON "Topic"("topic_name");

-- CreateIndex
CREATE INDEX "Topic_slug_idx" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_created_at_idx" ON "Topic"("created_at");

-- CreateIndex
CREATE INDEX "idx_topic_order_created" ON "Topic"("order", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Question_question_link_key" ON "Question"("question_link");

-- CreateIndex
CREATE INDEX "Question_topic_id_idx" ON "Question"("topic_id");

-- CreateIndex
CREATE INDEX "Question_platform_idx" ON "Question"("platform");

-- CreateIndex
CREATE INDEX "Question_level_idx" ON "Question"("level");

-- CreateIndex
CREATE INDEX "idx_question_topic_level" ON "Question"("topic_id", "level", "platform");

-- CreateIndex
CREATE INDEX "Class_batch_id_idx" ON "Class"("batch_id");

-- CreateIndex
CREATE INDEX "Class_topic_id_idx" ON "Class"("topic_id");

-- CreateIndex
CREATE INDEX "Class_batch_id_topic_id_idx" ON "Class"("batch_id", "topic_id");

-- CreateIndex
CREATE INDEX "Class_created_at_idx" ON "Class"("created_at");

-- CreateIndex
CREATE INDEX "idx_class_batch_topic_composite" ON "Class"("batch_id", "topic_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Class_topic_id_batch_id_slug_key" ON "Class"("topic_id", "batch_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Class_topic_id_batch_id_class_name_key" ON "Class"("topic_id", "batch_id", "class_name");

-- CreateIndex
CREATE INDEX "QuestionVisibility_class_id_idx" ON "QuestionVisibility"("class_id");

-- CreateIndex
CREATE INDEX "QuestionVisibility_question_id_idx" ON "QuestionVisibility"("question_id");

-- CreateIndex
CREATE INDEX "idx_question_visibility_class_batch" ON "QuestionVisibility"("class_id", "question_id", "type");

-- CreateIndex
CREATE INDEX "idx_question_visibility_assignment_date" ON "QuestionVisibility"("assigned_at", "class_id");

-- CreateIndex
CREATE INDEX "idx_question_visibility_question_lookup" ON "QuestionVisibility"("question_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionVisibility_class_id_question_id_key" ON "QuestionVisibility"("class_id", "question_id");

-- CreateIndex
CREATE INDEX "StudentProgress_student_id_idx" ON "StudentProgress"("student_id");

-- CreateIndex
CREATE INDEX "StudentProgress_question_id_idx" ON "StudentProgress"("question_id");

-- CreateIndex
CREATE INDEX "StudentProgress_student_id_question_id_idx" ON "StudentProgress"("student_id", "question_id");

-- CreateIndex
CREATE INDEX "idx_student_progress_composite" ON "StudentProgress"("student_id", "question_id", "sync_at");

-- CreateIndex
CREATE INDEX "idx_student_progress_sync_date" ON "StudentProgress"("sync_at", "student_id");

-- CreateIndex
CREATE INDEX "idx_student_progress_question_lookup" ON "StudentProgress"("question_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_student_id_question_id_key" ON "StudentProgress"("student_id", "question_id");

-- CreateIndex
CREATE INDEX "Leaderboard_alltime_global_rank_idx" ON "Leaderboard"("alltime_global_rank");

-- CreateIndex
CREATE INDEX "Leaderboard_max_streak_idx" ON "Leaderboard"("max_streak");

-- CreateIndex
CREATE INDEX "Leaderboard_last_calculated_idx" ON "Leaderboard"("last_calculated");

-- CreateIndex
CREATE INDEX "Leaderboard_student_id_idx" ON "Leaderboard"("student_id");

-- CreateIndex
CREATE INDEX "Leaderboard_student_id_alltime_global_rank_alltime_city_ran_idx" ON "Leaderboard"("student_id", "alltime_global_rank", "alltime_city_rank");

-- CreateIndex
CREATE INDEX "idx_leaderboard_global_ranking" ON "Leaderboard"("alltime_global_rank", "alltime_city_rank");

-- CreateIndex
CREATE INDEX "idx_leaderboard_calculation_time" ON "Leaderboard"("last_calculated");

-- CreateIndex
CREATE INDEX "PasswordResetOTP_email_idx" ON "PasswordResetOTP"("email");

-- CreateIndex
CREATE INDEX "PasswordResetOTP_expires_at_idx" ON "PasswordResetOTP"("expires_at");

-- CreateIndex
CREATE INDEX "idx_password_reset_expires" ON "PasswordResetOTP"("expires_at", "is_used");

-- CreateIndex
CREATE INDEX "Bookmark_student_id_idx" ON "Bookmark"("student_id");

-- CreateIndex
CREATE INDEX "Bookmark_question_id_idx" ON "Bookmark"("question_id");

-- CreateIndex
CREATE INDEX "Bookmark_student_id_created_at_idx" ON "Bookmark"("student_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_bookmark_student_created" ON "Bookmark"("student_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_student_id_question_id_key" ON "Bookmark"("student_id", "question_id");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVisibility" ADD CONSTRAINT "QuestionVisibility_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVisibility" ADD CONSTRAINT "QuestionVisibility_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

