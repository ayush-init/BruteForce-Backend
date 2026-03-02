import { Request, Response } from "express";
import { createClassInTopicService, deleteClassService, getClassDetailsService, getClassesByTopicService, updateClassService } from "../../services/class.service";


export const getClassesByTopic = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;

    const topicSlugParam = req.params.topicSlug;

    if (typeof topicSlugParam !== "string") {
      return res.status(400).json({
        error: "Invalid topic slug",
      });
    }

    const classes = await getClassesByTopicService({
      batchId: batch.id,
      topicSlug: topicSlugParam, // now guaranteed string
    });

    return res.json(classes);

  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const createClassInTopic = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;

    const topicSlugParam = req.params.topicSlug;

    if (typeof topicSlugParam !== "string") {
      return res.status(400).json({
        error: "Invalid topic slug",
      });
    }

    const {
      class_name,
      description,
      pdf_url,
      duration_minutes,
      class_date,
    } = req.body;

    const newClass = await createClassInTopicService({
      batchId: batch.id,
      topicSlug: topicSlugParam,
      class_name,
      description,
      pdf_url,
      duration_minutes,
      class_date,
    });

    return res.status(201).json({
      message: "Class created successfully",
      class: newClass,
    });

  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getClassDetails = async (
  req: Request,
  res: Response
) => {
 try {
    const batch = (req as any).batch;
    const classSlugParam = req.params.classSlug;

    if (typeof classSlugParam !== "string") {
      return res.status(400).json({
        error: "Invalid class slug",
      });
    }

    const result = await getClassDetailsService({
      batchId: batch.id,
      classSlug: classSlugParam,
    });

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const updateClass = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;
    const classSlug = req.params.classSlug;

    if (typeof classSlug !== "string") {
      return res.status(400).json({
        error: "Invalid class slug",
      });
    }

    const updated = await updateClassService({
      batchId: batch.id,
      classSlug,
      ...req.body,
    });

    return res.json({
      message: "Class updated successfully",
      class: updated,
    });

  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const deleteClass = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;
    const classSlug = req.params.classSlug;

    if (typeof classSlug !== "string") {
      return res.status(400).json({
        error: "Invalid class slug",
      });
    }

    await deleteClassService({
      batchId: batch.id,
      classSlug,
    });

    return res.json({
      message: "Class deleted successfully",
    });

  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
