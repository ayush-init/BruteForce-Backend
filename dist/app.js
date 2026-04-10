"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ApiError_1 = require("./utils/ApiError");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const superadmin_routes_1 = __importDefault(require("./routes/superadmin.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const sync_job_1 = require("./jobs/sync.job");
const rateLimiter_1 = require("./middlewares/rateLimiter");
require("./workers/studentSync.worker"); // Initialize BullMQ worker
require("./queues/studentSync.events"); // Initialize QueueEvents
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Apply global API rate limiter to all API routes
// Note: Specific routes with their own limiters will override this
app.use('/api', rateLimiter_1.apiLimiter);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use("/api/students", student_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api', public_routes_1.default); // Public routes (cities, batches)
app.use('/api/admin', admin_routes_1.default); // Teacher & Intern & admin
app.use('/api/superadmin', superadmin_routes_1.default); // Superadmin ONLY
// CSV UI directory removed - was referencing non-existent directory
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// 404 Fallback for unknown routes
app.use((req, res, next) => {
    next(new ApiError_1.NotFoundError(`Route ${req.originalUrl} not found`));
});
// Error handler (must be last)
app.use(errorHandler_middleware_1.errorHandler);
// Initialize cron jobs for leaderboard optimization
(0, sync_job_1.startSyncJob)();
exports.default = app;
