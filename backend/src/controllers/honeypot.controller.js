import axios from "axios";
import Conversation from "../models/conversation.model.js";
import { detectScam } from "../services/scamDetection.service.js";
import { runAgent } from "../services/agent.service.js";
import { extractIntel } from "../services/extraction.service.js";
import { calculateMetrics } from "../utils/metrics.util.js";

async function notifyGuvi(payload) {
    try {
        await axios.post(
            "https://hackathon.guvi.in/api/updateHoneyPotFinalResult",
            payload,
            { timeout: 3000 }
        );
    } catch (err) {
        console.error("GUVI callback failed:", err.message);
    }
}

export default async function honeypotController(req, res) {
    try {
        let message = "";

        // Official GUVI payload
        if (req.body?.message?.text) {
            message = req.body.message.text;
        }
        // Backward compatibility
        else if (req.body && typeof req.body === "object") {
            message =
                req.body.message ||
                req.body.input ||
                req.body.text ||
                req.body.prompt ||
                "";
        }
        // Plain text body
        else if (typeof req.body === "string") {
            message = req.body;
        }

        message = String(message || "").trim();

        const conversation_id =
            req.body?.sessionId ||
            req.body?.conversation_id ||
            req.body?.conversationId ||
            req.headers["x-conversation-id"] ||
            `auto-${Date.now()}`;

        let convo = await Conversation.findOne({ conversationId: conversation_id });
        if (!convo) {
            convo = await Conversation.create({
                conversationId: conversation_id,
                messages: [],
                scamDetected: false,
                extractedData: null
            });
        }

        if (message) {
            convo.messages.push({ role: "user", content: message });
        }

        const keywords = /verify|blocked|suspend|kyc|urgent|immediately|click|otp/i;
        const context = /bank|account|upi|payment/i;
        const hasLink = /(https?:\/\/|www\.|bit\.ly|tinyurl)/i.test(message);

        const linkIntent = /(click|tap|open).*(link)/i;

        const heuristicDetected =
            keywords.test(message) &&
            (
                context.test(message) ||
                hasLink ||
                linkIntent.test(message)
            );

        let aiDetection = { scam: false, confidence: 0 };
        try {
            aiDetection = await detectScam(message);
        } catch { }

        let riskScore = 0;
        if (heuristicDetected) riskScore += 0.6;
        if (aiDetection.confidence)
            riskScore += aiDetection.confidence * 0.3;

        riskScore = Math.min(riskScore, 1);
        const isScam = riskScore >= 0.6;

        if (isScam) {
            convo.scamDetected = true;

            const history = convo.messages
                .map(m => `${m.role}: ${m.content}`)
                .join("\n");

            // Internal-only (non-blocking)
            runAgent(history)
                // .then(r => console.log("Agent raw reply:", r))
                .catch(() => { });

            extractIntel(history)
                .then(data => convo.extractedData = data)
                .catch(() => { });
        }

        convo.save().catch(console.error);

        const metrics = calculateMetrics({
            ...convo.toObject(),
            messages: convo.messages.filter(m => m.role === "user")
        });
        // console.log("Metrics:", metrics);

        const NON_SCAM_REPLY =
            "Thanks for reaching out. Could you please provide more details?";

        const SAFE_SCAM_REPLIES = [
            "Why is my account being suspended? I haven’t received any notification.",
            "What verification is pending? I already completed my KYC earlier.",
            "Which account is this about? I use multiple services.",
            "Is there an official message or reference number for this?",
            "Can you explain what happens if I don’t update this today?"
        ];

        let reply = NON_SCAM_REPLY;

        if (isScam) {
            const seed = conversation_id
                .split("")
                .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

            reply = SAFE_SCAM_REPLIES[seed % SAFE_SCAM_REPLIES.length];

            if (req.body?.sessionId) {
                notifyGuvi({
                    sessionId: req.body.sessionId,
                    scamDetected: true,
                    confidence: Number(Math.min(0.95, riskScore).toFixed(2)),
                    reply,
                    timestamp: Date.now()
                });
            }
        }

        return res.status(200).json({
            status: "success",
            reply
        });

    } catch (err) {
        console.error("Honeypot controller error:", err);
        return res.status(200).json({
            status: "success",
            reply: "Sorry, I didn’t catch that. Can you repeat?"
        });
    }
}
