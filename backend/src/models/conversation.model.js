import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema(
    {
        conversationId: { type: String, unique: true, required: true },
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
    {
        timestamps: true,
        autoIndex: false
    }
);

if (!conversationSchema.indexes().some(idx => idx[0].conversationId)) {
    conversationSchema.index({ conversationId: 1 }, { unique: true });
    conversationSchema.index({ scamDetected: 1 });
    conversationSchema.index({ createdAt: -1 });
}

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);