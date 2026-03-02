import prisma from "../config/prisma";
import { generateBatchSlug } from "../utils/slug";

interface CreateBatchInput {
  batch_name: string;
  year: number;
  city_id: number;
}

export const createBatchService = async ({
  batch_name,
  year,
  city_id,
}: CreateBatchInput) => {

  if (!batch_name || !year || !city_id) {
    throw new Error("All fields are required");
  }

  const city = await prisma.city.findUnique({
    where: { id: city_id },
  });

  if (!city) {
    throw new Error("City not found");
  }

  // Prevent duplicate batch name + year in same city
  const duplicate = await prisma.batch.findFirst({
    where: {
      city_id,
      year,
      batch_name,
    },
  });

  if (duplicate) {
    throw new Error(
      "Batch with same name and year already exists in this city"
    );
  }

  if (!city.slug) {
    throw new Error("City slug is missing");
  }

  const baseSlug = generateBatchSlug(city.slug, batch_name, year);

  let finalSlug = baseSlug;
  let counter = 1;

  while (
    await prisma.batch.findFirst({
      where: { slug: finalSlug },
    })
  ) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  const batch = await prisma.batch.create({
    data: {
      batch_name,
      year,
      city_id,
      slug: finalSlug,
    },
  });

  return batch;
};


export const getAllBatchesService = async ({
  citySlug,
  year,
}: {
  citySlug?: string;
  year?: number;
}) => {

  const filters: any = {};

  if (citySlug) {
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
    });

    if (!city) {
      throw new Error("City not found");
    }

    filters.city_id = city.id;
  }

  if (year) {
    filters.year = year;
  }

  const batches = await prisma.batch.findMany({
    where: filters,
    include: {
      city: true,
      _count: {
        select: {
          students: true,
          classes: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return batches;
};

interface UpdateBatchInput {
  id: number;
  batch_name?: string;
  year?: number;
  city_id?: number;
}

export const updateBatchService = async ({
  id,
  batch_name,
  year,
  city_id,
}: UpdateBatchInput) => {

  const existingBatch = await prisma.batch.findUnique({
    where: { id },
  });

  if (!existingBatch) {
    throw new Error("Batch not found");
  }

  const finalBatchName = batch_name ?? existingBatch.batch_name;
  const finalYear = year ?? existingBatch.year;
  const finalCityId = city_id ?? existingBatch.city_id;

  const city = await prisma.city.findUnique({
    where: { id: finalCityId },
  });

  if (!city) {
    throw new Error("City not found");
  }

  if (!city.slug) {
    throw new Error("City slug is missing");
  }

  // Prevent duplicate inside same city
  const duplicate = await prisma.batch.findFirst({
    where: {
      city_id: finalCityId,
      year: finalYear,
      batch_name: finalBatchName,
      NOT: { id: existingBatch.id },
    },
  });

  if (duplicate) {
    throw new Error(
      "Batch with same name and year already exists in this city"
    );
  }

  let newSlug = existingBatch.slug;

  // Regenerate slug only if important fields changed
  if (batch_name || year || city_id) {
    const baseSlug = generateBatchSlug(
      city.slug,
      finalBatchName,
      finalYear
    );

    newSlug = baseSlug;
    let counter = 1;

    while (
      await prisma.batch.findFirst({
        where: {
          slug: newSlug,
          NOT: { id: existingBatch.id },
        },
      })
    ) {
      newSlug = `${baseSlug}-${counter++}`;
    }
  }

  const updatedBatch = await prisma.batch.update({
    where: { id: existingBatch.id },
    data: {
      batch_name: finalBatchName,
      year: finalYear,
      city_id: finalCityId,
      slug: newSlug,
    },
  });

  return updatedBatch;
};


interface DeleteBatchInput {
  id: number;
}

export const deleteBatchService = async ({ id }: DeleteBatchInput) => {

  const batch = await prisma.batch.findUnique({
    where: { id },
  });

  if (!batch) {
    throw new Error("Batch not found");
  }

  const studentCount = await prisma.student.count({
    where: { batch_id: batch.id },
  });

  if (studentCount > 0) {
    throw new Error("Cannot delete batch with active students");
  }

  await prisma.batch.delete({
    where: { id: batch.id },
  });

  return true;
};