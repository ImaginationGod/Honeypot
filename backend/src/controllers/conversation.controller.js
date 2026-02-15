import Conversation from "../models/conversation.model.js";

export const getAllConversations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const conversations = await Conversation.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select(
                "conversationId scamDetected extractedData createdAt updatedAt"
            );

        const total = await Conversation.countDocuments();

        res.status(200).json({
            status: "success",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalConversations: total,
            data: conversations,
        });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch conversations",
        });
    }
};

export const getConversationById = async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await Conversation.findOne({
            conversationId: id,
        });

        if (!conversation) {
            return res.status(404).json({
                status: "error",
                message: "Conversation not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: conversation,
        });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch conversation",
        });
    }
};
