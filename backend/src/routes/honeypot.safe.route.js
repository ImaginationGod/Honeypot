// src/routes/honeypot.safe.route.js
import express from "express";

const router = express.Router();

router.all("/honeypot/message", async (req, res) => {
    return res.status(200).json({
        scam_detected: false,
        confidence: 0.0,
        engagement: {
            conversation_id: "tester-auto",
            turns: 0,
            duration_seconds: 0
        },
        extracted_intelligence: {
            bank_accounts: [],
            upi_ids: [],
            phishing_urls: []
        }
    });
});

export default router;
