"use strict";
// src/services/leetcode.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLeetcodeData = fetchLeetcodeData;
const axios_1 = __importDefault(require("axios"));
const ApiError_1 = require("../utils/ApiError");
async function fetchLeetcodeData(username) {
    const response = await axios_1.default.post("https://leetcode.com/graphql", {
        query: `
        query userProfileData($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }

          recentSubmissionList(username: $username) {
            titleSlug
            statusDisplay
          }
        }
      `,
        variables: { username }
    }, {
        headers: {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
            "Origin": "https://leetcode.com"
        }
    });
    const data = response.data.data;
    if (!data.matchedUser) {
        throw new ApiError_1.ApiError(400, "Invalid LeetCode username");
    }
    const stats = data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const totalSolved = stats.find((s) => s.difficulty === "All")?.count || 0;
    return {
        totalSolved,
        submissions: data.recentSubmissionList
    };
}
