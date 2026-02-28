import { Request, Response } from "express";
import prisma from "../../config/prisma";

// Create City
export const createCity = async (req: Request, res: Response) => {
  try {
    const { city_name } = req.body;

    if (!city_name) {
      return res.status(400).json({ error: "City name is required" });
    }

    const existing = await prisma.city.findUnique({
      where: { city_name },
    });

    if (existing) {
      return res.status(400).json({ error: "City already exists" });
    }

    const city = await prisma.city.create({
      data: { city_name },
    });

    res.status(201).json({
      message: "City created successfully",
      city,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create city" });
  }
};

// Get All Cities (for dropdown)
export const getAllCities = async (_req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { created_at: "desc" },
    });

    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
};