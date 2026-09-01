import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import repositoryRoutes from "./routes/repositoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import awsConnectionRoutes from "./routes/awsConnectionRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
  origin: "*"
}));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "opsify-backend",
  });
});

app.use("/api/repositories", repositoryRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/aws", awsConnectionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});