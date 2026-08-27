import express from "express";

const app = express();

const PORT = process.env.PORT || 7000;

app.get("/", (req, res) => {
  res.send("Hello from Opsify!");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});