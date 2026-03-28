import { Request, Response } from "express";
import { syncOneStudent } from "../services/progressSync.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export async function manualSync(req: Request, res: Response) {
  try {
    const studentId = Number(req.params.id);

    const result = await syncOneStudent(studentId);

    return res.json(result);
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    return res.status(500).json({
      message: error.message
    });
  }
}