import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/routes";
import connectDB from "./config/database";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "SmartMall Analytics API",
    status: "Server running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/stores", (req, res) => {
  res.json({ message: "Store routes coming soon" });
});

app.use("/api/analytics", (req, res) => {
  res.json({ message: "Analytics routes coming soon" });
});

startServer();
