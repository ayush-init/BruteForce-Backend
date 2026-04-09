"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSlug = extractSlug;
function extractSlug(url) {
    return url.split("/problems/")[1]?.split("/")[0];
}
