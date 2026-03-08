"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStudentProgressController = exports.createStudentController = exports.getStudentReportController = exports.getAllStudentsController = exports.deleteStudentDetails = exports.updateStudentDetails = void 0;
const student_service_1 = require("../services/student.service");
const student_service_2 = require("../services/student.service");
const student_service_3 = require("../services/student.service");
const updateStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await (0, student_service_2.updateStudentDetailsService)(Number(id), req.body);
        return res.json({
            message: "Student updated successfully",
            data: student
        });
    }
    catch (error) {
        if (error.message === "Student not found") {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};
exports.updateStudentDetails = updateStudentDetails;
const deleteStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = Number(id);
        if (isNaN(studentId)) {
            return res.status(400).json({
                message: "Invalid student id"
            });
        }
        await (0, student_service_2.deleteStudentDetailsService)(studentId);
        return res.status(200).json({
            message: "Student deleted permanently"
        });
    }
    catch (error) {
        if (error.message === "Student not found") {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};
exports.deleteStudentDetails = deleteStudentDetails;
const getAllStudentsController = async (req, res) => {
    try {
        const result = await (0, student_service_2.getAllStudentsService)(req.query);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch students",
            error: error.message
        });
    }
};
exports.getAllStudentsController = getAllStudentsController;
const getStudentReportController = async (req, res) => {
    try {
        const { username } = req.params;
        const usernameStr = Array.isArray(username) ? username[0] : username;
        const result = await (0, student_service_2.getStudentReportService)(usernameStr);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch student report",
            error: error.message
        });
    }
};
exports.getStudentReportController = getStudentReportController;
const createStudentController = async (req, res) => {
    try {
        const student = await (0, student_service_3.createStudentService)(req.body);
        return res.status(201).json({
            message: "Student created successfully",
            data: student
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};
exports.createStudentController = createStudentController;
const addStudentProgressController = async (req, res) => {
    try {
        const { student_id, question_id } = req.body;
        if (!student_id || !question_id) {
            return res.status(400).json({
                message: "student_id and question_id are required"
            });
        }
        const progress = await (0, student_service_1.addStudentProgressService)(Number(student_id), Number(question_id));
        return res.status(201).json({
            message: "Student progress added successfully",
            data: progress
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};
exports.addStudentProgressController = addStudentProgressController;
