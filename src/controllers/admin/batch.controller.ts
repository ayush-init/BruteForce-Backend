import { Request, Response } from "express";
import prisma from "../../config/prisma";

// Create Batch
export const createBatch = async (req: Request, res: Response) => {
  try {
    const { batch_name, year, city_id } = req.body;

    if (!batch_name || !year || !city_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check city exists
    const city = await prisma.city.findUnique({
      where: { id: city_id },
    });

    if (!city) {
      return res.status(400).json({ error: "City not found" });
    }

    const batch = await prisma.batch.create({
      data: {
        batch_name,
        year,
        city_id,
      },
    });

    res.status(201).json({
      message: "Batch created successfully",
      batch,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Batch already exists for this city and year",
      });
    }

    res.status(500).json({ error: "Failed to create batch" });
  }
};

// Get Batches by City (for dropdown filtering)
export const getBatchesByCity = async (req: Request, res: Response) => {
  try {
    const { city_id } = req.params;

    const batches = await prisma.batch.findMany({
      where: { city_id: Number(city_id) },
      orderBy: { year: "desc" },
    });

    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch batches" });
  }
};