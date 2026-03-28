import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const completeProfile = asyncHandler(async (req: Request, res: Response) => {
          try {
            const studentId = req.user?.id;
            const { city_id, batch_id, leetcode_id, gfg_id, github, linkedin, username } = req.body;

            if (!city_id || !batch_id) {
              throw new ApiError(400, "City and Batch required");
            }

            // Validate batch belongs to city
            const batch = await prisma.batch.findUnique({
              where: { id: batch_id },
            });

            if (!batch || batch.city_id !== city_id) {
              throw new ApiError(400, "Invalid batch for selected city");
            }

            const updated = await prisma.student.update({
              where: { id: studentId },
              data: {
                city_id,
                batch_id,
                leetcode_id,
                gfg_id,
                github,
                linkedin,
                ...(username ? { username } : {})
              },
            });

            res.json({
              message: "Profile completed",
              user: updated,
            });
          } catch (error) {
    if (error instanceof ApiError) throw error;
            throw new ApiError(500, "Failed to complete profile");
          }
        });