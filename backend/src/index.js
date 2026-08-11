import express from "express";
import dotenv from "dotenv";
import { ExpressAuth } from "@auth/express";
import GitHub from "@auth/express/providers/github";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", true);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});