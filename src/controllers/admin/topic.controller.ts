import { Request, Response } from "express";
import prisma from "../../config/prisma";

// Create Topic
export const createTopic = async (req: Request, res: Response) => {
  try {
    const { topic_name } = req.body;

    if (!topic_name) {
      return res.status(400).json({ error: "Topic name is required" });
    }

    const existing = await prisma.topic.findUnique({
      where: { topic_name },
    });

    if (existing) {
      return res.status(400).json({ error: "Topic already exists" });
    }

    const topic = await prisma.topic.create({
      data: { topic_name },
    });

    res.status(201).json({
      message: "Topic created successfully",
      topic,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create topic" });
  }
};

// Get All Topics
export const getAllTopics = async (_req: Request, res: Response) => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { created_at: "desc" },
    });

    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};