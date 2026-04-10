"use strict";
// src/services/leetcode.service.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLeetcodeData = fetchLeetcodeData;
const axios_1 = __importDefault(require("axios"));
const ApiError_1 = require("../../utils/ApiError");
const bottleneck = __importStar(require("bottleneck"));
// Rate limiting configuration for LeetCode API
const leetcodeLimiter = new bottleneck.default({
    maxConcurrent: 1, // Only 1 request at a time
    minTime: 300, // 300ms between requests
});
async function fetchLeetcodeData(username) {
    const makeApiCall = async () => {
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
            },
            timeout: 5000 // 5 second timeout
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
    };
    // Use rate limiter with retry logic
    try {
        console.log(`[LeetCode] Fetching data for user: ${username}`);
        const result = await leetcodeLimiter.schedule(makeApiCall);
        console.log(`[LeetCode] Successfully fetched data for user: ${username}`);
        return result;
    }
    catch (error) {
        // Handle rate limiting (429) with exponential backoff
        if (error.response?.status === 429) {
            console.log(`[LeetCode] Rate limited for user: ${username}, will retry...`);
            throw new ApiError_1.ApiError(429, "LeetCode API rate limit exceeded");
        }
        if (error.code === 'ECONNABORTED') {
            throw new ApiError_1.ApiError(408, "LeetCode API request timeout");
        }
        console.error(`[LeetCode] Error fetching data for user: ${username}`, error);
        throw error;
    }
}
