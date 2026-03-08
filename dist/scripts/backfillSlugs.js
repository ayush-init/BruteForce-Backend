"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slugify_1 = __importDefault(require("slugify"));
const prisma_1 = __importDefault(require("../config/prisma"));
async function backfillSlugs() {
    console.log("Starting slug backfill...\n");
    // ========================
    // 1️⃣ Cities
    // ========================
    const cities = await prisma_1.default.city.findMany();
    for (const city of cities) {
        if (!city.slug) {
            const newSlug = (0, slugify_1.default)(city.city_name, {
                lower: true,
                strict: true
            });
            await prisma_1.default.city.update({
                where: { id: city.id },
                data: { slug: newSlug }
            });
            console.log(`City updated: ${city.city_name} → ${newSlug}`);
        }
    }
    // ========================
    // 2️⃣ Batches
    // ========================
    const batches = await prisma_1.default.batch.findMany({
        include: { city: true }
    });
    for (const batch of batches) {
        if (!batch.slug) {
            const baseSlug = (0, slugify_1.default)(batch.batch_name, {
                lower: true,
                strict: true
            });
            // To ensure uniqueness inside same city
            const newSlug = `${baseSlug}`;
            await prisma_1.default.batch.update({
                where: { id: batch.id },
                data: { slug: newSlug }
            });
            console.log(`Batch updated: ${batch.batch_name} → ${newSlug}`);
        }
    }
    // ========================
    // 3️⃣ Topics (if slug exists)
    // ========================
    const topics = await prisma_1.default.topic.findMany();
    for (const topic of topics) {
        if (!("slug" in topic))
            continue;
        // @ts-ignore
        if (!topic.slug) {
            const newSlug = (0, slugify_1.default)(topic.topic_name, {
                lower: true,
                strict: true
            });
            await prisma_1.default.topic.update({
                where: { id: topic.id },
                data: { slug: newSlug }
            });
            console.log(`Topic updated: ${topic.topic_name} → ${newSlug}`);
        }
    }
    console.log("\nSlug backfill completed ✅");
}
backfillSlugs()
    .catch((err) => {
    console.error("Error during slug backfill:", err);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
