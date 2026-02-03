import Conversation from "../models/conversation.model.js";
import { detectScam } from "../services/scamDetection.service.js";
import { runAgent } from "../services/agent.service.js";
import { extractIntel } from "../services/extraction.service.js";
import { calculateMetrics } from "../utils/metrics.util.js";
import { formatResponse } from "../utils/responseFormatter.js";

export default async function honeypotController(req, res, next) {
    try {
        let message = "";

        if (req.body && typeof req.body === "object") {
            message =
                req.body.message ||
                req.body.input ||
                req.body.text ||
                req.body.prompt ||
                "";
        }

        if (!message && typeof req.body === "string") {
            message = req.body;
        }

        message = String(message || "").trim();

        const conversation_id =
            req.body?.conversation_id ||
            req.body?.conversationId ||
            req.headers["x-conversation-id"] ||
            `auto-${Date.now()}`;

        if (!message) {
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
                messages: [],
                scamDetected: false,
                extractedData: null
            });
        }

        convo.messages.push({ role: "user", content: message });

        const heuristic = /account|verify|blocked|suspend|kyc|urgent|bank/i;
        const heuristicDetected = heuristic.test(message);

        let aiDetection = { scam: false, confidence: 0 };
        try {
            aiDetection = await detectScam(message);
        } 
        // catch (err) {
        //     console.error("detectScam error:", err);
        // }
        catch {}

        const isScam = aiDetection.scam || heuristicDetected;

        const detection = {
            scam: isScam,
            confidence: isScam ? Math.max(aiDetection.confidence || 0.6, 0.6) : 0
        };

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

        return res.status(200).json(
            formatResponse({
                detection,
                conversation: convo,
                metrics,
                extracted: convo.extractedData
            })
        );

    } catch (err) {
        console.error("Honeypot controller error:", err);

        return res.status(200).json({
            scam_detected: false,
            confidence: 0,
            engagement: {
                conversation_id: "fallback",
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
}
