"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPlatform = void 0;
const client_1 = require("@prisma/client");
const detectPlatform = (link) => {
    const normalized = link.toLowerCase();
    if (normalized.includes("leetcode.com"))
        return client_1.Platform.LEETCODE;
    if (normalized.includes("geeksforgeeks.org"))
        return client_1.Platform.GFG;
    if (normalized.includes("interviewbit.com"))
        return client_1.Platform.INTERVIEWBIT;
    return client_1.Platform.OTHER;
};
exports.detectPlatform = detectPlatform;
