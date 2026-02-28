-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'TEACHER', 'INTERN');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('LEETCODE', 'GFG', 'OTHER');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('HOMEWORK', 'CLASSWORK');

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
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'INTERN',
    "city_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "topic_name" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "question_name" VARCHAR(255) NOT NULL,
    "question_link" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'LEETCODE',
    "level" "Level" NOT NULL DEFAULT 'MEDIUM',
    "type" "QuestionType" NOT NULL DEFAULT 'HOMEWORK',
    "topic_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "class_number" VARCHAR(50),
    "pdf_url" TEXT,
    "description" TEXT,
    "duration_minutes" INTEGER,
    "class_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionVisibility" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "solved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_city_name_key" ON "City"("city_name");

-- CreateIndex
CREATE INDEX "Batch_city_id_idx" ON "Batch"("city_id");

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
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE INDEX "Admin_city_id_idx" ON "Admin"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_topic_name_key" ON "Topic"("topic_name");

-- CreateIndex
CREATE INDEX "Question_topic_id_idx" ON "Question"("topic_id");

-- CreateIndex
CREATE INDEX "Question_platform_idx" ON "Question"("platform");

-- CreateIndex
CREATE INDEX "Question_level_idx" ON "Question"("level");

-- CreateIndex
CREATE INDEX "Class_batch_id_idx" ON "Class"("batch_id");

-- CreateIndex
CREATE INDEX "Class_topic_id_idx" ON "Class"("topic_id");

-- CreateIndex
CREATE INDEX "QuestionVisibility_question_id_idx" ON "QuestionVisibility"("question_id");

-- CreateIndex
CREATE INDEX "QuestionVisibility_batch_id_idx" ON "QuestionVisibility"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionVisibility_class_id_question_id_key" ON "QuestionVisibility"("class_id", "question_id");

-- CreateIndex
CREATE INDEX "StudentProgress_student_id_idx" ON "StudentProgress"("student_id");

-- CreateIndex
CREATE INDEX "StudentProgress_question_id_idx" ON "StudentProgress"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_student_id_question_id_key" ON "StudentProgress"("student_id", "question_id");

-- CreateIndex
CREATE INDEX "Bookmark_student_id_idx" ON "Bookmark"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_student_id_question_id_key" ON "Bookmark"("student_id", "question_id");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVisibility" ADD CONSTRAINT "QuestionVisibility_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVisibility" ADD CONSTRAINT "QuestionVisibility_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVisibility" ADD CONSTRAINT "QuestionVisibility_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
