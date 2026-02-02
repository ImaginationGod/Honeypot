import { API_KEY } from "../config/env.js";

export default function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || token !== API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}
