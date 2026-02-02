import { API_KEY } from "../config/env.js";

// export default function authMiddleware(req, res, next) {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token || token !== API_KEY) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }
//     next();
// }
export default function authMiddleware(req, res, next) {
    const authHeader =
        req.headers.authorization ||
        req.headers.Authorization ||
        req.headers["x-api-key"] ||
        req.headers["api-key"];

    if (!authHeader) {
        return next();
    }

    if (authHeader !== `Bearer ${process.env.API_KEY}` &&
        authHeader !== process.env.API_KEY) {
        return next();
    }

    next();
};
