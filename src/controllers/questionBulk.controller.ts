import { Request, Response } from "express";
import { bulkUploadQuestionsService } from "../services/questionBulk.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const bulkUploadQuestions = asyncHandler(async (
          req: Request,
          res: Response
        ) => {
          try {
            if (!req.file) {
              throw new ApiError(400, "CSV file is required",);
            }

            const { topicId } = req.body;

            if (!topicId) {
              throw new ApiError(400, "Topic ID is required",);
            }

            const result = await bulkUploadQuestionsService(
              req.file.buffer,
              Number(topicId)
            );

            return res.json({
              message: "Bulk upload successful",
              ...result,
            });

          } catch (error: any) {
    if (error instanceof ApiError) throw error;
            throw new ApiError(400, error.message,);
          }
        });