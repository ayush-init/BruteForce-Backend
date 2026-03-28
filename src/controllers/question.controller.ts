import { Request, Response } from "express";

import { createQuestionService, deleteQuestionService, getAllQuestionsService, getAssignedQuestionsService, updateQuestionService } from "../services/question.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const createQuestion = asyncHandler(async (
          req: Request,
          res: Response
        ) => {
          try {
            const question = await createQuestionService(req.body);

            return res.status(201).json({
              message: "Question created successfully",
              question,
            });

          } catch (error: any) {
    if (error instanceof ApiError) throw error;
            throw new ApiError(400, error.message,);
          }
        });


export const getAllQuestions = asyncHandler(async (
          req: Request,
          res: Response
        ) => {
          try {
            const {
              topicSlug,
              level,
              platform,
              type,
              search,
              page,
              limit,
            } = req.query;

            const result = await getAllQuestionsService({
              topicSlug: topicSlug as string | undefined,
              level: level as string | undefined,
              platform: platform as string | undefined,
              type: type as string | undefined,
              search: search as string | undefined,
              page: page ? Number(page) : 1,
              limit: limit ? Number(limit) : 10,
            });

            return res.json(result);

          } catch (error: any) {
    if (error instanceof ApiError) throw error;
            throw new ApiError(400, error.message,);
          }
        });


export const updateQuestion = asyncHandler(async (
          req: Request,
          res: Response
        ) => {
          try {
            const { id } = req.params;

            const updated = await updateQuestionService({
              id: Number(id),
              ...req.body,
            });

            return res.json({
              message: "Question updated successfully",
              question: updated,
            });

          } catch (error: any) {
    if (error instanceof ApiError) throw error;
            throw new ApiError(400, error.message,);
          }
        });

export const deleteQuestion = asyncHandler(async (
          req: Request,
          res: Response
        ) => {
          try {
            const { id } = req.params;

            await deleteQuestionService({
              id: Number(id),
            });

            return res.json({
              message: "Question deleted successfully",
            });

          } catch (error: any) {
    if (error instanceof ApiError) throw error;
            throw new ApiError(400, error.message,);
          }
        });





export const getAssignedQuestionsController = asyncHandler(async (
          req: Request,
          res: Response
        ) => {
          try {

            const data = await getAssignedQuestionsService(req.query);

            return res.status(200).json({
              success: true,
              data
            });

          } catch (error: any) {
    if (error instanceof ApiError) throw error;

            return res.status(400).json({
              success: false,
              error: error.message || "Failed to fetch questions"
            });

          }
        });