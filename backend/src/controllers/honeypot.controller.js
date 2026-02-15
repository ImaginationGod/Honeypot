import axios from "axios";
import Conversation from "../models/conversation.model.js";
import { detectScam } from "../services/scamDetection.service.js";
import { agentPersonaPrompt } from "../prompts/agentPersona.prompt.js";
import { runAgent } from "../services/agent.service.js";
import { extractIntel } from "../services/extraction.service.js";

export default async function honeypotController(req, res) {
    const withTimeout = (promise, ms) =>
        Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), ms)
            )
        ]);

    const normalizeExtractedIntel = (raw = {}) => ({
        bankAccounts: raw.bankAccounts || raw.bank_accounts || [],
        upiIds: raw.upiIds || raw.upi_ids || [],
        phishingLinks: raw.phishingLinks || raw.phishing_urls || [],
        phoneNumbers: raw.phoneNumbers || [],
        suspiciousKeywords: raw.suspiciousKeywords || [],
        agentNotes: raw.agentNotes || ""
    });

    try {
        let body = req.body;
        if (typeof body === "string") {
            try { body = JSON.parse(body); } catch { }
        }

        const safeId =
            body?.sessionId ||
            body?.message?.sessionId ||
            body?.conversation_id ||
            `auto-${Date.now()}`;

        let message = "";
        if (body?.message?.text) {
            message = typeof body.message.text === "string"
                ? body.message.text
                : JSON.stringify(body.message.text);
        } else if (body?.text) {
            message = typeof body.text === "string"
                ? body.text
                : JSON.stringify(body.text);
        } else if (typeof body === "string") {
            message = body;
        }

        message = message.trim();
        const text = message.toLowerCase();

        let convo = await Conversation.findOne({ conversationId: safeId });
        if (!convo) {
            convo = await Conversation.create({
                conversationId: safeId,
                messages: [],
                scamDetected: false,
                extractedData: {
                    bankAccounts: [],
                    upiIds: [],
                    phishingLinks: [],
                    phoneNumbers: [],
                    suspiciousKeywords: []
                }
            });
        }

        if (message) {
            convo.messages.push({ role: "user", content: message });
            await convo.save();
        }

        // ENHANCED HEURISTIC ENGINE
        const urgencyPattern = /(urgent|immediately|right now|asap|quickly)/i;
        const paymentPattern = /(pay|send|transfer|processing fee|charges|deposit)/i;
        const financialPattern = /(bank|account|upi|wallet|loan|credit|debit)/i;
        const govtPattern = /(govt|government|subsidy|aadhaar|pan|income tax|rbi|sbi|official)/i;
        const impersonationPattern = /(hi (mom|dad|bro|sis)|this is my new number|lost my phone|i'?m in trouble)/i;
        const loanScamPattern = /(loan.*approved|instant loan|pre-approved loan)/i;
        const moneyPattern = /(₹\s?\d+|\d+\s?(rupees|rs))/i;
        const dataHarvestPattern = /(submit|provide|share).*(details|information|bank|account|aadhaar|otp)/i;

        const hasUpi = /[\w.-]+@[\w.-]+/.test(message);
        const hasLink = /(https?:\/\/|www\.|bit\.ly|tinyurl)/i.test(message);
        const hasPhoneNumber = /(\+?\d{1,3}[\s-]?)?\d{10}/.test(message);

        let heuristicScore = 0;

        if (urgencyPattern.test(text)) heuristicScore += 0.2;
        if (paymentPattern.test(text)) heuristicScore += 0.2;
        if (financialPattern.test(text)) heuristicScore += 0.2;
        if (govtPattern.test(text)) heuristicScore += 0.3;
        if (impersonationPattern.test(text)) heuristicScore += 0.4;
        if (loanScamPattern.test(text)) heuristicScore += 0.4;
        if (moneyPattern.test(text)) heuristicScore += 0.2;
        if (dataHarvestPattern.test(text)) heuristicScore += 0.4;
        if (hasLink) heuristicScore += 0.4;
        if (hasUpi) heuristicScore += 0.4;
        if (hasPhoneNumber) heuristicScore += 0.2;

        const heuristicContribution = Math.min(heuristicScore, 0.7);

        // AI Detection
        let aiDetection = { scam: false, confidence: 0 };
        try {
            aiDetection = await withTimeout(detectScam(message), 1200);
        } catch { }

        const aiContribution = (aiDetection?.confidence || 0) * 0.3;

        let riskScore = heuristicContribution + aiContribution;
        riskScore = Math.min(riskScore, 1);

        const alreadyFlagged = convo.scamDetected === true;
        const isScam = alreadyFlagged || riskScore >= 0.6;

        // Explainability Engine
        const triggers = [];

        if (impersonationPattern.test(text)) triggers.push("Impersonation attempt detected");
        if (loanScamPattern.test(text)) triggers.push("Loan scam pattern detected");
        if (govtPattern.test(text)) triggers.push("Government impersonation detected");
        if (dataHarvestPattern.test(text)) triggers.push("Sensitive data request detected");
        if (paymentPattern.test(text)) triggers.push("Payment request detected");
        if (urgencyPattern.test(text)) triggers.push("Urgency language detected");
        if (hasLink) triggers.push("Suspicious URL detected");
        if (hasUpi) triggers.push("UPI ID detected");
        if (hasPhoneNumber) triggers.push("Phone number detected");
        if (moneyPattern.test(text)) triggers.push("Monetary amount mentioned");
        if (aiDetection?.confidence > 0.5)
            triggers.push(`AI confidence high (${aiDetection.confidence})`);

        let reply = "Thanks for reaching out. Could you please provide more details?";

        // SCAM FLOW
        if (isScam) {
            convo.scamDetected = true;

            const history = convo.messages
                .map(m => `${m.role}: ${m.content}`)
                .join("\n");

            try {
                const prompt = agentPersonaPrompt(history);
                const rawReply = await withTimeout(runAgent(prompt), 4000);
                reply = rawReply.replace(/^["']|["']$/g, "").trim();
            } catch {
                reply = "I'm not sure I understand. Could you clarify what I need to do?";
            }

            res.status(200).json({
                status: "success",
                reply,
                conversationId: safeId,
                scamDetected: true,
                messageCount: convo.messages.length,
                risk: {
                    finalScore: Number(riskScore.toFixed(2)),
                    heuristic: Number(heuristicContribution.toFixed(2)),
                    aiConfidence: aiDetection?.confidence || 0,
                    weightedAI: Number(aiContribution.toFixed(2))
                },
                explanation: {
                    triggered: triggers.length > 0,
                    reasons: triggers
                }
            });

            // Background processing
            (async () => {
                try {
                    let extracted = normalizeExtractedIntel(
                        await extractIntel(history + `\nassistant: ${reply}`)
                    );

                    await Conversation.findOneAndUpdate(
                        { conversationId: safeId },
                        {
                            $set: {
                                scamDetected: true,
                                extractedData: extracted
                            },
                            $push: {
                                messages: { role: "assistant", content: reply }
                            }
                        }
                    );
                } catch (err) {
                    console.error("Background Worker Error:", err);
                }
            })();

        } else {
            convo.messages.push({ role: "assistant", content: reply });
            await convo.save();

            return res.status(200).json({
                status: "success",
                reply,
                conversationId: safeId,
                scamDetected: false,
                messageCount: convo.messages.length,
                risk: {
                    finalScore: Number(riskScore.toFixed(2)),
                    heuristic: Number(heuristicContribution.toFixed(2)),
                    aiConfidence: aiDetection?.confidence || 0,
                    weightedAI: Number(aiContribution.toFixed(2))
                },
                explanation: {
                    triggered: triggers.length > 0,
                    reasons: triggers
                }
            });
        }

    } catch (err) {
        console.error("Critical Honeypot Error:", err);
        return res.status(200).json({
            status: "success",
            reply: "Sorry, I didn't quite catch that. Can you repeat?"
        });
    }
}
