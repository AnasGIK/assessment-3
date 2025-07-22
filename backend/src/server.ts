import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/routes";
import connectDB from "./config/database";
import { Store, User } from "./models/models";
import { authenticateToken, authorizeRoles } from "./middlewares/middlewares";
import mongoose from "mongoose";
import { CLIENT_RENEG_LIMIT } from "tls";

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

app.post(
  "/api/stores",
  authenticateToken,
  authorizeRoles("admin"),
  async (req: Request, res: Response) => {
    try {
      const { name, category, floor, manager } = req.body;

      console.log(name, category, floor, manager);

      if (!name || !category || !floor || !manager) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if manager exists and is a StoreManager
      const existingManager = await User.findById(manager);
      if (!existingManager || existingManager.role !== "store-manager") {
        return res.status(400).json({ error: "Invalid StoreManager ID" });
      }

      // Create store
      const newStore = new Store({
        name,
        category,
        floor,
        manager: manager,
      });

      await newStore.save();

      // Update manager's store reference
      manager.store = newStore._id as mongoose.Types.ObjectId;;
      await manager.save();

      res.status(201).json({ message: "Store created", store: newStore });
    } catch (err) {
      console.error("Error creating store:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.use("/api/analytics", (req, res) => {
  res.json({ message: "Analytics routes coming soon" });
});

startServer();
