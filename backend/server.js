import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { PORT } from "./config/env.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "*";
const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

const apiLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use(express.json());
app.use(cors({ origin: corsOrigin }));
app.use(morgan("combined"));
app.use(apiLimiter);

app.use("/api/flashcards", flashcardRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.send("Server is running 🚀");
});

app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  const message = error.message || "Internal Server Error";

  console.error("Global error handler:", error);

  res.status(statusCode).json({
    success: false,
    message,
  });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
