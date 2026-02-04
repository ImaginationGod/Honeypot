import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema(
    {
        conversationId: { type: String, unique: true, index: true, required: true },
        messages: [messageSchema],
        scamDetected: { type: Boolean, default: false },
        finalCallbackSent: { type: Boolean, default: false },
        extractedData: {
            bankAccounts: { type: [String], default: [] },
            upiIds: { type: [String], default: [] },
            phishingLinks: { type: [String], default: [] },
            phoneNumbers: { type: [String], default: [] },
            suspiciousKeywords: { type: [String], default: [] },
            agentNotes: { type: String, default: "" }
        }
    },
    { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);