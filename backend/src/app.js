import express from "express";
import cors from "cors";
import honeypotRoutes from "./routes/honeypot.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/honeypot", honeypotRoutes);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use(errorMiddleware);

export default app;
