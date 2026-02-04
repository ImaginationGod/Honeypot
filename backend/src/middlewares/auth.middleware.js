import { API_KEY } from "../config/env.js";

export default function authMiddleware(req, res, next) {

    if (req.method === "GET" && req.path.includes("/honeypot")) {
        return next();
    }

    const authHeader =
        req.headers.authorization ||
        req.headers["x-api-key"] ||
        req.headers["api-key"];

    if (!authHeader) {
        return res.status(200).json({
            scam_detected: false,
            confidence: 0,
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
    }

    if (
        authHeader !== API_KEY &&
        authHeader !== `Bearer ${API_KEY}`
    ) {
        return res.status(200).json({
            scam_detected: false,
            confidence: 0,
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
    }

    next();
}
