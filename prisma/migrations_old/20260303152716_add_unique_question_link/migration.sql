/*
  Warnings:

  - A unique constraint covering the columns `[question_link]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Question_question_link_key" ON "Question"("question_link");
