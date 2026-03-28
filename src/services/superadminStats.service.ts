import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export const getSuperAdminStatsService = async () => {
    try {
        const [
            totalCities,
            totalBatches,
            totalAdmins,
            
        ] = await Promise.all([
            prisma.city.count(),
            prisma.batch.count(),
            (prisma as any).admin.count({
                where: {
                    role: 'TEACHER'
                }
            }),
            
        ]);

        return {
            totalCities,
            totalBatches,
            totalAdmins,
            
        };
    } catch (error) {
        console.error("System stats error:", error);
        throw new ApiError(400, "Failed to fetch system statistics");
        
    }
};

