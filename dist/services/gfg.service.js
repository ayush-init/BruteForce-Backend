"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGfgData = fetchGfgData;
const axios_1 = __importDefault(require("axios"));
const ApiError_1 = require("../utils/ApiError");
async function fetchGfgData(handle) {
    const response = await axios_1.default.post("https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/", { handle }, {
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        }
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
}
