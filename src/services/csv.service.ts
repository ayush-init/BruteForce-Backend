import prisma from "../config/prisma";

export const generateBatchReportCSV = async (batchId: number | string) => {
    // Validate and convert batch_id
    if (!batchId || isNaN(parseInt(batchId as string))) {
        throw new Error("Valid batch_id is required");
    }

    const batchIdNum = parseInt(batchId as string);

    // Get batch details with city
    const batch = await prisma.batch.findUnique({
        where: { id: batchIdNum },
        include: {
            city: {
                select: { 
                    city_name: true 
                }
            }
        }
    });

    if (!batch) {
        throw new Error("Batch not found");
    }

    // Get all students in this batch with their progress and leaderboard data
    const students = await prisma.student.findMany({
        where: { batch_id: batchIdNum },
        include: {
            batch: {
                select: { batch_name: true }
            },
            leaderboards: {
                select: {
                    easy_solved: true,
                    medium_solved: true,
                    hard_solved: true,
                    alltime_city_rank: true,
                    alltime_global_rank: true
                }
            }
        }
    });

    // Calculate totals for column headers
    const totalEasyAssigned = batch.easy_assigned || 0;
    const totalMediumAssigned = batch.medium_assigned || 0;
    const totalHardAssigned = batch.hard_assigned || 0;
    const totalAssigned = totalEasyAssigned + totalMediumAssigned + totalHardAssigned;

    // Generate CSV content
    const csvHeaders = [
        'Enrollment ID',
        'Name',
        'Email',
        'Batch Name',
        `Hard Solved (out of ${totalHardAssigned})`,
        `Medium Solved (out of ${totalMediumAssigned})`,
        `Easy Solved (out of ${totalEasyAssigned})`,
        `Total Solved (out of ${totalAssigned})`,
        'All Time City Rank',
        'All Time Global Rank',
        'LeetCode ID',
        'GeeksforGeeks ID'
    ];

    const csvRows = students.map(student => {
        const easySolved = student.leaderboards?.easy_solved || 0;
        const mediumSolved = student.leaderboards?.medium_solved || 0;
        const hardSolved = student.leaderboards?.hard_solved || 0;
        const totalSolved = easySolved + mediumSolved + hardSolved;

        return [
            student.enrollment_id || '',
            student.name || '',
            student.email || '',
            student.batch?.batch_name || '',
            hardSolved.toString(),
            mediumSolved.toString(),
            easySolved.toString(),
            totalSolved.toString(),
            student.leaderboards?.alltime_city_rank?.toString() || 'N/A',
            student.leaderboards?.alltime_global_rank?.toString() || 'N/A',
            student.leetcode_id || '',
            student.gfg_id || ''
        ];
    });

    // Convert to CSV format
    const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Generate filename
    const filename = `${batch.city.city_name}-${batch.batch_name}-${batch.year}.csv`;

    return {
        csvContent,
        filename
    };
};
