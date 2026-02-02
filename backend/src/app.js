import express from "express";
import cors from "cors";
import honeypotRoutes from "./routes/honeypot.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "agentic-honeypot"
  });
});

app.use("/api/honeypot", honeypotRoutes);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use(errorMiddleware);

export default app;
