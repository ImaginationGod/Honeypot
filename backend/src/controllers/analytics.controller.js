import Conversation from "../models/conversation.model.js";

export const getAnalytics = async (req, res) => {
    try {
        const totalSessions = await Conversation.countDocuments();
        const totalScams = await Conversation.countDocuments({
            scamDetected: true,
        });

        // Extract total phishing links
        const phishingLinksAgg = await Conversation.aggregate([
            { $unwind: "$extractedData.phishingLinks" },
            { $count: "totalLinks" },
        ]);

        // Extract total UPI IDs
        const upiAgg = await Conversation.aggregate([
            { $unwind: "$extractedData.upiIds" },
            { $count: "totalUpiIds" },
        ]);

        // Sessions over time (grouped by day)
        const sessionsOverTime = await Conversation.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);

        res.status(200).json({
            status: "success",
            data: {
                totalSessions,
                totalScams,
                totalSafe: totalSessions - totalScams,
                totalPhishingLinks: phishingLinksAgg[0]?.totalLinks || 0,
                totalUpiIds: upiAgg[0]?.totalUpiIds || 0,
                sessionsOverTime,
            },
        });
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch analytics",
        });
    }
};
