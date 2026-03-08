"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const getDashboardController = async (req, res) => {
    try {
        const data = await (0, dashboard_service_1.getDashboardService)(req.query);
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch dashboard data"
        });
    }
};
exports.getDashboardController = getDashboardController;
