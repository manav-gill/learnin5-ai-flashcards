import express from "express";

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
