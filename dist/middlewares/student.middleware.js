"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStudentInfo = void 0;
const extractStudentInfo = (req, res, next) => {
    const user = req.user;
    if (user?.userType === 'student') {
        // 🔑 Extract student-specific info from token
        req.student = user; // Set the entire user object
        req.studentId = user.id; // Set studentId explicitly
        req.batchId = user.batchId;
        req.batchName = user.batchName;
        req.batchSlug = user.batchSlug;
        req.cityId = user.cityId;
        req.cityName = user.cityName;
        console.log('Student middleware extracted:', {
            studentId: req.studentId,
            batchId: req.batchId,
            batchName: req.batchName,
            batchSlug: req.batchSlug,
            cityId: req.cityId,
            cityName: req.cityName
        });
    }
    next();
};
exports.extractStudentInfo = extractStudentInfo;
