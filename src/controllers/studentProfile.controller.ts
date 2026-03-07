import { Request, Response } from "express";
import { StudentRequest } from "../middlewares/student.middleware";
import {
  getStudentProfileService,
  getStudentBasicInfo,
  getCodingStats,
  getStreakInfo,
  getLeaderboardStats,
  getHeatmapData,
  getTopicProgress,
  getRecentActivity
} from "../services/studentProfile.service";

export const getStudentProfile = async (req: StudentRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: "Student ID not found" });
    }

    const profile = await getStudentProfileService(studentId);
    res.json(profile);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get student profile" 
    });
  }
};

export const testStudentBasicInfo = async (req: StudentRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: "Student ID not found" });
    }

    const basicInfo = await getStudentBasicInfo(studentId);
    res.json(basicInfo);
  } catch (error) {
    console.error("Basic info test error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get student basic info" 
    });
  }
};

export const testCodingStats = async (req: StudentRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: "Student ID not found" });
    }

    const codingStats = await getCodingStats(studentId);
    res.json(codingStats);
  } catch (error) {
    console.error("Coding stats test error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get coding stats" 
    });
  }
};

export const testStreak = async (req: StudentRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: "Student ID not found" });
    }

    const streak = await getStreakInfo(studentId);
    res.json(streak);
  } catch (error) {
    console.error("Streak test error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get streak info" 
    });
  }
};

export const testLeaderboard = async (req: StudentRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: "Student ID not found" });
    }

    const leaderboard = await getLeaderboardStats(studentId);
    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard test error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get leaderboard stats" 
    });
  }
};

export const testHeatmap = async (req: StudentRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: "Student ID not found" });
    }

    const heatmap = await getHeatmapData(studentId);
    res.json(heatmap);
  } catch (error) {
    console.error("Heatmap test error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get heatmap data" 
    });
  }
};

export const testTopicProgress = async (req: StudentRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: "Student ID not found" });
    }

    const topicProgress = await getTopicProgress(studentId);
    res.json(topicProgress);
  } catch (error) {
    console.error("Topic progress test error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get topic progress" 
    });
  }
};

export const testRecentActivity = async (req: StudentRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: "Student ID not found" });
    }

    const recentActivity = await getRecentActivity(studentId);
    res.json(recentActivity);
  } catch (error) {
    console.error("Recent activity test error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get recent activity" 
    });
  }
};
