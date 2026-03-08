"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const superadmin_routes_1 = __importDefault(require("./routes/superadmin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use("/api/students", student_routes_1.default);
app.use('/api/admin', admin_routes_1.default); // Teacher & Intern & admin
app.use('/api/superadmin', superadmin_routes_1.default); // Superadmin ONLY
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handler (must be last)
app.use(errorHandler_middleware_1.errorHandler);
exports.default = app;
