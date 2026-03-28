import { Request, Response } from "express";
import { fetchLeetcodeData } from "../services/leetcode.service";
import { fetchGfgData } from "../services/gfg.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export async function testLeetcode(req: Request, res: Response) {
  try {
    const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;

    const data = await fetchLeetcodeData(username);

    return res.json(data);
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function testGfg(req: Request, res: Response) {
  try {
    const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;

    const data = await fetchGfgData(username);

    return res.json(data);
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    return res.status(500).json({
      message: error.message
    });
  }
}