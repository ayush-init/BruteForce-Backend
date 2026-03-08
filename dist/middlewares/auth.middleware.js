"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    console.log("Token:", token);
    console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
    try {
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        console.log("Decoded:", decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ error: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
