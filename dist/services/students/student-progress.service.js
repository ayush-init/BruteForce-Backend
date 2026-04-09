"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStudentProgressService = exports.getStudentReportService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const errorMapper_1 = require("../../utils/errorMapper");
const ApiError_1 = require("../../utils/ApiError");
const getStudentReportService = async (username) => {
    try {
        const student = await prisma_1.default.student.findUnique({
            where: { username },
            include: {
                city: true,
                batch: true,
                progress: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                platform: true,
                                level: true,
                                topic_id: true,
                                topic: {
                                    select: {
                                        topic_name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { sync_at: "desc" },
                    take: 5
                }
            }
        });
        if (!student) {
            throw new ApiError_1.ApiError(400, "Student not found");
        }
        const [solvedQuestions, visibilityTypes, batchQuestions, topics] = await Promise.all([
            // solved questions by student
            prisma_1.default.studentProgress.findMany({
                where: { student_id: student.id },
                include: {
                    question: {
                        select: {
                            id: true,
                            platform: true,
                            level: true,
                            topic_id: true
                        }
                    }
                }
            }),
            // get visibility types for solved questions in student's batch
            prisma_1.default.questionVisibility.findMany({
                where: {
                    class: { batch_id: student.batch_id || undefined },
                    question: {
                        progress: {
                            some: { student_id: student.id }
                        }
                    }
                },
                select: {
                    question_id: true,
                    type: true
                }
            }),
            // questions assigned to this batch
            prisma_1.default.question.findMany({
                where: {
                    visibility: {
                        some: {
                            class: {
                                batch_id: student.batch_id || undefined
                            }
                        }
                    }
                },
                select: {
                    id: true,
                    topic_id: true
                }
            }),
            prisma_1.default.topic.findMany({
                select: {
                    id: true,
                    topic_name: true
                }
            })
        ]);
        // ---------- stats calculation ----------
        let totalSolved = solvedQuestions.length;
        // Create visibility type map
        const visibilityTypeMap = new Map(visibilityTypes.map(v => [v.question_id, v.type]));
        const platformStats = {
            leetcode: {
                total: 0,
                easy: 0,
                medium: 0,
                hard: 0,
                homework: 0,
                classwork: 0
            },
            gfg: {
                total: 0,
                easy: 0,
                medium: 0,
                hard: 0,
                homework: 0,
                classwork: 0
            }
        };
        const difficultyStats = {
            easy: 0,
            medium: 0,
            hard: 0
        };
        const typeStats = {
            homework: 0,
            classwork: 0
        };
        const solvedTopicMap = {};
        const totalTopicMap = {};
        // solved stats
        solvedQuestions.forEach(s => {
            const q = s.question;
            const platform = q.platform === "LEETCODE" ? "leetcode" :
                q.platform === "GFG" ? "gfg" : null;
            if (platform) {
                platformStats[platform].total++;
                if (q.level === "EASY")
                    platformStats[platform].easy++;
                if (q.level === "MEDIUM")
                    platformStats[platform].medium++;
                if (q.level === "HARD")
                    platformStats[platform].hard++;
                const qType = visibilityTypeMap.get(q.id) || 'HOMEWORK';
                if (qType === "HOMEWORK")
                    platformStats[platform].homework++;
                if (qType === "CLASSWORK")
                    platformStats[platform].classwork++;
            }
            // existing global stats
            if (q.level === "EASY")
                difficultyStats.easy++;
            if (q.level === "MEDIUM")
                difficultyStats.medium++;
            if (q.level === "HARD")
                difficultyStats.hard++;
            const qType2 = visibilityTypeMap.get(q.id) || 'HOMEWORK';
            if (qType2 === "HOMEWORK")
                typeStats.homework++;
            if (qType2 === "CLASSWORK")
                typeStats.classwork++;
            solvedTopicMap[q.topic_id] =
                (solvedTopicMap[q.topic_id] || 0) + 1;
        });
        // total questions per topic
        batchQuestions.forEach(q => {
            totalTopicMap[q.topic_id] =
                (totalTopicMap[q.topic_id] || 0) + 1;
        });
        const topicStats = Object.keys(totalTopicMap).map(topicId => {
            const topic = topics.find(t => t.id === Number(topicId));
            return {
                topic: topic?.topic_name || "Unknown",
                totalQuestions: totalTopicMap[Number(topicId)],
                solvedByStudent: solvedTopicMap[Number(topicId)] || 0
            };
        });
        return {
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                city: student.city?.city_name,
                batch: {
                    batch_name: student.batch?.batch_name,
                    year: student.batch?.year
                },
                created_at: student.created_at
            },
            stats: {
                totalSolved,
                platforms: platformStats,
                difficulty: difficultyStats,
                type: typeStats,
                topicStats
            },
            recentActivity: student.progress
        };
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(404, "Student not found");
            }
        }
        throw new ApiError_1.ApiError(500, "Failed to fetch student report");
    }
};
exports.getStudentReportService = getStudentReportService;
const addStudentProgressService = async (student_id, question_id) => {
    try {
        // check student
        const student = await prisma_1.default.student.findUnique({
            where: { id: student_id }
        });
        if (!student) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student not found");
        }
        // check question
        const question = await prisma_1.default.question.findUnique({
            where: { id: question_id }
        });
        if (!question) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Question not found");
        }
        // create progress
        const progress = await prisma_1.default.studentProgress.create({
            data: {
                student_id,
                question_id
            }
        });
        return progress;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            // duplicate solved question
            if (error.code === "P2002") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Student already solved this question");
            }
            // foreign key error
            if (error.code === "P2003") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.BAD_REQUEST, "Invalid student or question reference");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to add student progress");
    }
};
exports.addStudentProgressService = addStudentProgressService;
