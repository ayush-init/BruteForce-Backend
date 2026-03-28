import { Request, Response } from "express";
import { getPublicStudentProfileService } from "../services/studentProfile.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
          try {
            const { id } = req.params;
            const currentUserId = (req as any).user?.id; // From optional auth middleware
            
            if (!id || Array.isArray(id)) {
              throw new ApiError(400, "Student ID is required");
            }

            // First get student by ID to find their username
            const prisma = require("../config/prisma").default;
            const student = await prisma.student.findUnique({
              where: { id: parseInt(id) },
              select: { username: true }
            });

            if (!student) {
              throw new ApiError(404, "Student not found");
            }

            if (!student.username) {
              throw new ApiError(404, "Student profile not accessible - username not set");
            }

            // Use existing service with the username
            const profile = await getPublicStudentProfileService(student.username);
            
            // Add canEdit flag if current user is viewing their own profile
            const canEdit = currentUserId && profile.student.id === currentUserId;
            
            res.json({ ...profile, canEdit });
          } catch (error) {
    if (error instanceof ApiError) throw error;
            console.error("Student by ID error:", error);
            throw new ApiError(500, error instanceof Error ? error.message : "Failed to get student profile by ID");
          }
        });
