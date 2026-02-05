import axios from "axios";
import Conversation from "../models/conversation.model.js";
import { detectScam } from "../services/scamDetection.service.js";
import { agentPersonaPrompt } from "../prompts/agentPersona.prompt.js";
import { runAgent } from "../services/agent.service.js";
import { extractIntel } from "../services/extraction.service.js";

async function notifyGuviFinal(convo) {
    const payload = {
        sessionId: convo.conversationId,
        scamDetected: true,
        totalMessagesExchanged: convo.messages.length,
        extractedIntelligence: {
            bankAccounts: convo.extractedData?.bankAccounts || [],
            upiIds: convo.extractedData?.upiIds || [],
            phishingLinks: convo.extractedData?.phishingLinks || [],
            phoneNumbers: convo.extractedData?.phoneNumbers || [],
            suspiciousKeywords: convo.extractedData?.suspiciousKeywords || []
        },
        agentNotes: convo.extractedData?.agentNotes || "Scammer engagement successful. Intelligence captured."
    };

    try {
        await axios.post(
            "https://hackathon.guvi.in/api/updateHoneyPotFinalResult",
            payload,
            { timeout: 5000 }
        );
        console.log(`Final Callback sent for session: ${convo.conversationId}`);
        // console.log(payload)
    } catch (err) {
        console.error("GUVI mandatory callback failed:", err.message);
    }
}

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
        upilds: raw.upiIds || raw.upi_ids || raw.upilds || [],
        phishingLinks: raw.phishingLinks || raw.phishing_urls || [],
        phoneNumbers: raw.phoneNumbers || [],
        suspiciousKeywords: raw.suspiciousKeywords || [],
        agentNotes: raw.agentNotes || ""
    });

    try {
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch { }
        }
        const safeId =
            body?.sessionId ||
            body?.message?.sessionId ||
            body?.conversation_id ||
            `auto-${Date.now()}`;

        let message = "";
        if (body?.message?.text) message = body.message.text;
        else if (body?.text) message = body.text;
        else if (typeof body === "string") message = body;
        message = String(message || "").trim();

        let convo = await Conversation.findOne({ conversationId: safeId });

        if (!convo) {
            convo = await Conversation.create({
                conversationId: safeId,
                messages: [],
                scamDetected: false,
                extractedData: { bankAccounts: [], upiIds: [], phishingLinks: [], phoneNumbers: [], suspiciousKeywords: [] }
            });
        }

        if (message) {
            convo.messages.push({ role: "user", content: message });
            await convo.save();
        }

        const keywords = /verify|blocked|suspend|kyc|urgent|immediately|click|otp|pay|rupees|official|disconnected|prize|job/i;
        const context = /bank|account|upi|payment|id|vpa|wallet|electricity|bill/i;
        const hasUpi = /[\w.-]+@[\w.-]+/.test(message);
        const hasLink = /(https?:\/\/|www\.|bit\.ly|tinyurl)/i.test(message);
        const linkIntent = /(click|tap|open).*(link)/i;
        const hasPhoneNumber = /(\+?\d{1,3}[\s-]?)?\d{10}/.test(message);

        const heuristicDetected = (keywords.test(message) && context.test(message)) || hasLink || hasUpi || hasPhoneNumber || linkIntent.test(message);

        let aiDetection = { scam: false, confidence: 0 };
        try { aiDetection = await withTimeout(detectScam(message), 1200); } catch { }

        const alreadyFlagged = convo.scamDetected === true;
        let riskScore = 0;
        if (heuristicDetected) riskScore += 0.7;
        if (aiDetection.confidence) riskScore += aiDetection.confidence * 0.3;

        const isScam = alreadyFlagged || (Math.min(riskScore, 1) >= 0.6);

        let reply = "Thanks for reaching out. Could you please provide more details?";

        if (isScam) {
            convo.scamDetected = true;
            const history = convo.messages.map(m => `${m.role}: ${m.content}`).join("\n");

            try {
                const prompt = agentPersonaPrompt(history);
                let rawReply = await runAgent(prompt);
                reply = rawReply.replace(/^["']|["']$/g, '').trim();
            } catch (e) {
                reply = "I'm a bit confused. What exactly do I need to do to fix this?";
            }
            res.status(200).json({
                status: "success",
                reply: reply
            });

            (async () => {
                try {
                    let extracted = {
                        bankAccounts: [],
                        upiIds: [],
                        phishingLinks: [],
                        phoneNumbers: [],
                        suspiciousKeywords: [],
                        agentNotes: ""
                    };

                    try {
                        const rawExtracted = await extractIntel(history);
                        extracted = normalizeExtractedIntel(rawExtracted);
                    } catch (err) {
                        console.warn("Extraction failed, continuing without intel");
                    }

                    const updatedConvo = await Conversation.findOneAndUpdate(
                        { conversationId: safeId },
                        {
                            $set: { scamDetected: true, extractedData: extracted },
                            $push: { messages: { role: "assistant", content: reply } }
                        },
                        { new: true, upsert: true }
                    );

                    if (!updatedConvo.finalCallbackSent) {
                        await notifyGuviFinal(updatedConvo);

                        await Conversation.updateOne(
                            { conversationId: safeId },
                            { $set: { finalCallbackSent: true } }
                        );
                    }

                } catch (err) {
                    console.error("Background Worker Error:", err);
                }
            })();
        } else {
            convo.messages.push({ role: "assistant", content: reply });
            await convo.save();
            return res.status(200).json({
                status: "success",
                reply: reply
            });
        }

    } catch (err) {
        console.error("Critical Honeypot Error:", err);
        return res.status(200).json({ status: "success", reply: "Sorry, I didn't quite catch that. Can you repeat?" });
    }
}
// import axios from "axios";
// import Conversation from "../models/conversation.model.js";
// import { detectScam } from "../services/scamDetection.service.js";
// import { agentPersonaPrompt } from "../prompts/agentPersona.prompt.js";
// import { runAgent } from "../services/agent.service.js";
// import { extractIntel } from "../services/extraction.service.js";

// async function notifyGuviFinal(convo) {
//     const payload = {
//         sessionId: convo.conversationId,
//         scamDetected: true,
//         totalMessagesExchanged: convo.messages.length,
//         extractedIntelligence: {
//             bankAccounts: convo.extractedData?.bankAccounts || [],
//             upiIds: convo.extractedData?.upiIds || [],
//             phishingLinks: convo.extractedData?.phishingLinks || [],
//             phoneNumbers: convo.extractedData?.phoneNumbers || [],
//             suspiciousKeywords: convo.extractedData?.suspiciousKeywords || []
//         },
//         agentNotes:
//             convo.extractedData?.agentNotes ||
//             "Scammer engagement successful. Intelligence captured."
//     };

//     try {
//         await axios.post(
//             "https://hackathon.guvi.in/api/updateHoneyPotFinalResult",
//             payload,
//             { timeout: 5000 }
//         );
//     } catch (err) {
//         console.error("GUVI mandatory callback failed:", err.message);
//     }
// }

// export default async function honeypotController(req, res) {
//     const withTimeout = (promise, ms) =>
//         Promise.race([
//             promise,
//             new Promise((_, reject) =>
//                 setTimeout(() => reject(new Error("Timeout")), ms)
//             )
//         ]);

//     const normalizeExtractedIntel = (raw = {}) => ({
//         bankAccounts: raw.bankAccounts || raw.bank_accounts || [],
//         upiIds: raw.upiIds || raw.upi_Ids || raw.upiIds || [],
//         phishingLinks: raw.phishingLinks || raw.phishing_urls || [],
//         phoneNumbers: raw.phoneNumbers || [],
//         suspiciousKeywords: raw.suspiciousKeywords || [],
//         agentNotes: raw.agentNotes || ""
//     });

//     try {
//         let body = req.body;
//         if (typeof body === "string") {
//             try {
//                 body = JSON.parse(body);
//             } catch { }
//         }

//         const safeId =
//             body?.sessionId ||
//             body?.message?.sessionId ||
//             body?.conversation_id ||
//             `auto-${Date.now()}`;

//         let message = body?.message?.text || body?.text || "";
//         message = String(message).trim();

//         let convo = await Conversation.findOne({ conversationId: safeId });

//         if (!convo) {
//             convo = await Conversation.create({
//                 conversationId: safeId,
//                 messages: [],
//                 scamDetected: false,
//                 extractedData: {
//                     bankAccounts: [],
//                     upiIds: [],
//                     phishingLinks: [],
//                     phoneNumbers: [],
//                     suspiciousKeywords: []
//                 }
//             });
//         }

//         if (message) {
//             convo.messages.push({ role: "user", content: message });
//             await convo.save();
//         }

//         const keywords =
//             /verify|blocked|suspend|kyc|urgent|immediately|click|otp|pay|rupees|official|disconnected|prize|job/i;
//         const context =
//             /bank|account|upi|payment|id|vpa|wallet|electricity|bill/i;

//         const hasUpi = /[\w.-]+@[\w.-]+/.test(message);
//         const hasLink = /(https?:\/\/|www\.|bit\.ly|tinyurl)/i.test(message);
//         const hasPhoneNumber = /(\+?\d{1,3}[\s-]?)?\d{10}/.test(message);

//         const heuristicDetected =
//             (keywords.test(message) && context.test(message)) ||
//             hasUpi ||
//             hasLink ||
//             hasPhoneNumber;

//         let aiDetection = { confidence: 0 };
//         try {
//             aiDetection = await withTimeout(detectScam(message), 1200);
//         } catch { }

//         let riskScore = 0;
//         if (heuristicDetected) riskScore += 0.7;
//         if (aiDetection.confidence) riskScore += aiDetection.confidence * 0.3;

//         const isScam =
//             convo.scamDetected || Math.min(riskScore, 1) >= 0.6;

//         const fastReply = isScam
//             ? "I’m really worried about my account. Can you tell me exactly what I need to do?"
//             : "Thanks for reaching out. Could you please provide more details?";

//         res.status(200).json({
//             status: "success",
//             reply: fastReply
//         });

//         if (!isScam) return;

//         (async () => {
//             try {
//                 convo.scamDetected = true;

//                 const history = convo.messages
//                     .map(m => `${m.role}: ${m.content}`)
//                     .join("\n");

//                 let aiReply = fastReply;
//                 try {
//                     const prompt = agentPersonaPrompt(history);
//                     aiReply = await runAgent(prompt);
//                     aiReply = aiReply.replace(/^["']|["']$/g, "").trim();
//                 } catch { }

//                 const extractionContext =
//                     `${history}\nassistant: ${aiReply}`;

//                 let extracted = {};
//                 try {
//                     const raw = await extractIntel(extractionContext);
//                     extracted = normalizeExtractedIntel(raw);
//                 } catch { }

//                 const updatedConvo =
//                     await Conversation.findOneAndUpdate(
//                         { conversationId: safeId },
//                         {
//                             $set: {
//                                 scamDetected: true,
//                                 extractedData: extracted
//                             },
//                             $push: {
//                                 messages: {
//                                     role: "assistant",
//                                     content: aiReply
//                                 }
//                             }
//                         },
//                         { new: true }
//                     );

//                 if (!updatedConvo.finalCallbackSent) {
//                     await notifyGuviFinal(updatedConvo);
//                     await Conversation.updateOne(
//                         { conversationId: safeId },
//                         { $set: { finalCallbackSent: true } }
//                     );
//                 }
//             } catch (err) {
//                 console.error("Background Worker Error:", err);
//             }
//         })();

//     } catch (err) {
//         console.error("Critical Honeypot Error:", err);
//         return res.status(200).json({
//             status: "success",
//             reply: "Sorry, I didn’t catch that. Can you repeat?"
//         });
//     }
// }
