import { API_KEY } from "../config/env.js";

export default function authMiddleware(req, res, next) {
    const authHeader =
        req.headers.authorization ||
        req.headers.Authorization ||
        req.headers["x-api-key"] ||
        req.headers["api-key"];

    if (!authHeader) {
        return next();
    }

    if (authHeader !== `Bearer ${API_KEY}` &&
        authHeader !== API_KEY) {
        return next();
    }

    next();
};
