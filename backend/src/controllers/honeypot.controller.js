import Conversation from "../models/conversation.model.js";
import { detectScam } from "../services/scamDetection.service.js";
import { runAgent } from "../services/agent.service.js";
import { extractIntel } from "../services/extraction.service.js";
import { calculateMetrics } from "../utils/metrics.util.js";
import { formatResponse } from "../utils/responseFormatter.js";

export default async function honeypotController(req, res, next) {
    try {
        // const { conversation_id, message } = req.body;
        const body = req.body || {};

        const message =
            body.message ||
            body.input ||
            body.text ||
            body.prompt ||
            null;

        const conversation_id =
            body.conversation_id ||
            body.conversationId ||
            `auto-${Date.now()}`;

        if (!message || typeof message !== "string") {
            return res.status(200).json({
                scam_detected: false,
                confidence: 0,
                engagement: {
                    conversation_id,
                    turns: 0,
                    duration_seconds: 0
                },
                extracted_intelligence: {
                    bank_accounts: [],
                    upi_ids: [],
                    phishing_urls: []
                }
            });
        }

        let convo = await Conversation.findOne({ conversationId: conversation_id });
        if (!convo) {
            convo = await Conversation.create({
                conversationId: conversation_id,
                messages: []
            });
        }

        convo.messages.push({ role: "user", content: message });

        const detection = convo.scamDetected
            ? { scam: true, confidence: 1 }
            : await detectScam(message);

        if (detection.scam) {
            convo.scamDetected = true;

            const history = convo.messages
                .map((m) => `${m.role}: ${m.content}`)
                .join("\n");

            const agentReply = await runAgent(history);
            convo.messages.push({ role: "agent", content: agentReply });

            const extracted = await extractIntel(history);
            convo.extractedData = extracted;
        }

        await convo.save();

        const metrics = calculateMetrics(convo);

        res.json(
            formatResponse({
                detection,
                conversation: convo,
                metrics,
                extracted: convo.extractedData
            })
        );
    } catch (err) {
        next(err);
    }
}
