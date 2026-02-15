import express from "express";
import cors from "cors";
import honeypotRoutes from "./routes/honeypot.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());

app.use(express.text({ type: "*/*" }));
app.use(express.json({ limit: "2mb", strict: false }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "agentic-honeypot"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// For ping service
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.use("/api/honeypot", honeypotRoutes);

app.use("/conversations", conversationRoutes);
app.use("/analytics", analyticsRoutes);

app.use(errorMiddleware);

export default app;
