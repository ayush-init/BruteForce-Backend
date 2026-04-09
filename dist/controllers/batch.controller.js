"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBatch = exports.updateBatch = exports.getAllBatches = exports.createBatch = void 0;
const batch_crud_service_1 = require("../services/batches/batch-crud.service");
const batch_query_service_1 = require("../services/batches/batch-query.service");
const asyncHandler_1 = require("../utils/asyncHandler");
//  CREATE BATCH
exports.createBatch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { batch_name, year, city_id } = req.body;
    const batch = await (0, batch_crud_service_1.createBatchService)({
        batch_name,
        year: Number(year),
        city_id: Number(city_id),
    });
    return res.status(201).json({
        message: "Batch created successfully",
        batch,
    });
});
// 📋 GET ALL BATCHES 
exports.getAllBatches = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { city, year } = req.query;
    const batches = await (0, batch_query_service_1.getAllBatchesService)({
        city: city,
        year: year ? Number(year) : undefined,
    });
    return res.json(batches);
});
//  UPDATE BATCH
exports.updateBatch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { batch_name, year, city_id } = req.body;
    const updatedBatch = await (0, batch_crud_service_1.updateBatchService)({
        id: Number(id),
        batch_name,
        year: year ? Number(year) : undefined,
        city_id: city_id ? Number(city_id) : undefined,
    });
    return res.json({
        message: "Batch updated successfully",
        batch: updatedBatch,
    });
});
//  DELETE BATCH
exports.deleteBatch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    await (0, batch_crud_service_1.deleteBatchService)({ id });
    return res.json({
        message: "Batch deleted successfully",
    });
});
