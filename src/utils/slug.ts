import slugify from "slugify";

export const generateBatchSlug = (
  citySlug: string,
  batchName: string,
  year: number
) => {
  return `${citySlug}-${slugify(batchName, {
    lower: true,
    strict: true,
  })}-${year}`;
};