import { API_KEY } from "../config/env.js";

export default function authMiddleware(req, res, next) {

    if (process.env.TESTER_MODE === "true") {
        return next();
    }

    const authHeader =
        req.headers.authorization ||
        req.headers["x-api-key"] ||
        req.headers["api-key"];

    if (!authHeader) {
        return res.status(401).json({
            error: "API key missing"
        });
    }

    if (
        authHeader !== API_KEY &&
        authHeader !== `Bearer ${API_KEY}`
    ) {
        return res.status(403).json({
            error: "Invalid API key"
        });
    }

    next();
}
