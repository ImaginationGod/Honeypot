import express from "express";
import cors from "cors";
import honeypotRoutes from "./routes/honeypot.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());

app.use(express.text({ type: "*/*" }));
app.use(express.json({ limit: "2mb", strict: false }));
app.use(express.urlencoded({ extended: true }));

// if (process.env.TESTER_MODE === "true") {
//   console.log("TESTER MODE ENABLED");

//   app.all("/api/honeypot/message", (req, res) => {
//     return res.status(200).json({
//       scam_detected: false,
//       confidence: 0,
//       engagement: {
//         conversation_id: "tester-auto",
//         turns: 0,
//         duration_seconds: 0
//       },
//       extracted_intelligence: {
//         bank_accounts: [],
//         upi_ids: [],
//         phishing_urls: []
//       }
//     });
//   });
// }

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "agentic-honeypot"
  });
});

app.use("/api/honeypot", honeypotRoutes);

app.use(errorMiddleware);

export default app;
