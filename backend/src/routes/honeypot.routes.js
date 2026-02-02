import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import honeypotController from "../controllers/honeypot.controller.js";

const router = express.Router();

router.post("/message", authMiddleware, honeypotController);
router.get("/message", authMiddleware, honeypotController);

export default router;
