import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getAllConversations, getConversationById, } from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getAllConversations);
router.get("/:id", authMiddleware, getConversationById);

export default router;
