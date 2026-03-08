"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAdminInfo = void 0;
const extractAdminInfo = (req, res, next) => {
    const user = req.user;
    if (user?.userType === 'admin') {
        // 🔑 Extract admin-specific info from token
        req.admin = user;
        req.defaultBatchId = user.batchId;
        req.defaultBatchName = user.batchName;
        req.defaultBatchSlug = user.batchSlug;
        req.defaultCityId = user.cityId;
        req.defaultCityName = user.cityName;
        console.log('Admin middleware extracted defaults:', {
            defaultBatchId: req.defaultBatchId,
            defaultBatchName: req.defaultBatchName,
            defaultBatchSlug: req.defaultBatchSlug,
            defaultCityId: req.defaultCityId,
            defaultCityName: req.defaultCityName
        });
    }
    next();
};
exports.extractAdminInfo = extractAdminInfo;
