"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRecentActivity = exports.testTopicProgress = exports.testHeatmap = exports.testLeaderboard = exports.testStreak = exports.testCodingStats = exports.testStudentBasicInfo = exports.getStudentProfile = void 0;
const studentProfile_service_1 = require("../services/studentProfile.service");
const getStudentProfile = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ error: "Student ID not found" });
        }
        const profile = await (0, studentProfile_service_1.getStudentProfileService)(studentId);
        res.json(profile);
    }
    catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get student profile"
        });
    }
};
exports.getStudentProfile = getStudentProfile;
const testStudentBasicInfo = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ error: "Student ID not found" });
        }
        const basicInfo = await (0, studentProfile_service_1.getStudentBasicInfo)(studentId);
        res.json(basicInfo);
    }
    catch (error) {
        console.error("Basic info test error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get student basic info"
        });
    }
};
exports.testStudentBasicInfo = testStudentBasicInfo;
const testCodingStats = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ error: "Student ID not found" });
        }
        const codingStats = await (0, studentProfile_service_1.getCodingStats)(studentId);
        res.json(codingStats);
    }
    catch (error) {
        console.error("Coding stats test error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get coding stats"
        });
    }
};
exports.testCodingStats = testCodingStats;
const testStreak = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ error: "Student ID not found" });
        }
        const streak = await (0, studentProfile_service_1.getStreakInfo)(studentId);
        res.json(streak);
    }
    catch (error) {
        console.error("Streak test error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get streak info"
        });
    }
};
exports.testStreak = testStreak;
const testLeaderboard = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ error: "Student ID not found" });
        }
        const leaderboard = await (0, studentProfile_service_1.getLeaderboardStats)(studentId);
        res.json(leaderboard);
    }
    catch (error) {
        console.error("Leaderboard test error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get leaderboard stats"
        });
    }
};
exports.testLeaderboard = testLeaderboard;
const testHeatmap = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ error: "Student ID not found" });
        }
        const heatmap = await (0, studentProfile_service_1.getHeatmapData)(studentId);
        res.json(heatmap);
    }
    catch (error) {
        console.error("Heatmap test error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get heatmap data"
        });
    }
};
exports.testHeatmap = testHeatmap;
const testTopicProgress = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ error: "Student ID not found" });
        }
        const topicProgress = await (0, studentProfile_service_1.getTopicProgress)(studentId);
        res.json(topicProgress);
    }
    catch (error) {
        console.error("Topic progress test error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get topic progress"
        });
    }
};
exports.testTopicProgress = testTopicProgress;
const testRecentActivity = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            return res.status(401).json({ error: "Student ID not found" });
        }
        const recentActivity = await (0, studentProfile_service_1.getRecentActivity)(studentId);
        res.json(recentActivity);
    }
    catch (error) {
        console.error("Recent activity test error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get recent activity"
        });
    }
};
exports.testRecentActivity = testRecentActivity;
