"use strict";
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
exports.fetchGfgData = fetchGfgData;
const axios_1 = __importDefault(require("axios"));
const ApiError_1 = require("../../utils/ApiError");
const bottleneck = __importStar(require("bottleneck"));
// Rate limiting configuration for GFG API
const gfgLimiter = new bottleneck.default({
    maxConcurrent: 1, // Only 1 request at a time
    minTime: 500, // 500ms between requests
});
async function fetchGfgData(handle) {
    const makeApiCall = async () => {
        const response = await axios_1.default.post("https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/", { handle }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            timeout: 5000 // 5 second timeout
        });
        const data = response.data;
        if (data.status !== "success") {
            throw new ApiError_1.ApiError(400, "Invalid GFG handle");
        }
        const totalSolved = data.count;
        const solvedSlugs = [];
        // result contains: Easy, Medium, Hard, Basic
        for (const difficulty in data.result) {
            const problemsObject = data.result[difficulty];
            // Each difficulty contains problemId as key
            for (const problemId in problemsObject) {
                const problem = problemsObject[problemId];
                if (problem.slug) {
                    solvedSlugs.push(problem.slug);
                }
            }
        }
        return {
            totalSolved,
            solvedSlugs
        };
    };
    // Use rate limiter with retry logic
    try {
        console.log(`[GFG] Fetching data for user: ${handle}`);
        const result = await gfgLimiter.schedule(makeApiCall);
        console.log(`[GFG] Successfully fetched data for user: ${handle}`);
        return result;
    }
    catch (error) {
        // Handle rate limiting (429) with exponential backoff
        if (error.response?.status === 429) {
            console.log(`[GFG] Rate limited for user: ${handle}, will retry...`);
            throw new ApiError_1.ApiError(429, "GFG API rate limit exceeded");
        }
        if (error.code === 'ECONNABORTED') {
            throw new ApiError_1.ApiError(408, "GFG API request timeout");
        }
        console.error(`[GFG] Error fetching data for user: ${handle}`, error);
        throw error;
    }
}
