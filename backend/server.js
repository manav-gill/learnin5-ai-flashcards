import dotenv from "dotenv";
dotenv.config();

// Now use dynamic imports for modules that depend on environment variables
async function startServer() {
  const express = (await import("express")).default;
  const cors = (await import("cors")).default;
  const morgan = (await import("morgan")).default;
  const mongoose = (await import("mongoose")).default;
  const rateLimit = (await import("express-rate-limit")).default;
  const { default: flashcardRoutes } = await import("./routes/flashcardRoutes.js");
  const { default: authRoutes } = await import("./routes/authRoutes.js");
  const { JWT_SECRET, MONGO_URI, PORT } = await import("./config/env.js");

  if (!MONGO_URI) {
    throw new Error("Missing MongoDB URI. Set MONGO_URI or MONGODB_URL in backend/.env");
  }

  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET. Set JWT_SECRET in backend/.env");
  }

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB connected");

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
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
