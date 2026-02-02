import express from "express";
import cors from "cors";
import honeypotRoutes from "./routes/honeypot.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import honeypotSafeRoute from "./routes/honeypot.safe.route.js";
import authMiddleware from "./middlewares/auth.middleware.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "*/*" }));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "agentic-honeypot"
  });
});

if (process.env.TESTER_MODE === "true") {
  app.use("/api", honeypotSafeRoute);
}
app.use("/api/honeypot", honeypotRoutes);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use(errorMiddleware);

export default app;
