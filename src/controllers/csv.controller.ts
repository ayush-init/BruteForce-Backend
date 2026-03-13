import { Request, Response } from "express";
import { generateBatchReportCSV } from "../services/csv.service";

export const downloadBatchReportController = async (req: Request, res: Response) => {
    try {
        const { batch_id } = req.body;

        // Generate CSV report (service handles validation)
        const { csvContent, filename } = await generateBatchReportCSV(batch_id);

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        return res.status(200).send(csvContent);

    } catch (error) {
        console.error("Download batch report error:", error);
        
        // Handle different error types
        if (error instanceof Error) {
            if (error.message.includes("Valid batch_id is required")) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes("Batch not found")) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
        }
        
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to generate batch report"
        });
    }
};
