import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: String,
    content: String
});

const conversationSchema = new mongoose.Schema(
    {
        conversationId: { type: String, unique: true },
        messages: [messageSchema],
        scamDetected: { type: Boolean, default: false },
        extractedData: {
            bank_accounts: [],
            upi_ids: [],
            phishing_urls: []
        }
    },
    { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
