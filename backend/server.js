import express from "express";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import { PORT } from "./config/env.js";

const app = express();

app.use(express.json());
app.use("/api/flashcards", flashcardRoutes);

app.get("/api/health", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
