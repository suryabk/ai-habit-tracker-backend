import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./middleware/errorHandler.js";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";

const app = express();

const allowedOrigin = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin))
      return callback(null, true);
    if (allowedOrigin.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port localhost:${PORT}`);
  });
});
