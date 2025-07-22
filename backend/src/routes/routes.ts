import bcrypt from "bcryptjs";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { authenticateToken, authorizeRoles } from "../middlewares/middlewares";
import { User, WalkInLog } from "../models/models";

const router = Router();

const JWT_SECRET = String(process.env.JWT_SECRET);

router.post("/register-admin", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email exists" });

    const user = await User.create({ email, password, role: "admin" });
    await user.save();

    res.status(201).json({ message: "Admin created", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
});

router.post("/register-store-manager", async (req, res) => {
  const { email, name, password, storeId } = req.body;
  try {
    const user = await User.create({
      email,
      password,
      name,
      role: "store-manager",
      store: storeId,
    });

    res
      .status(201)
      .json({ message: "Store manager registered", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Error registering store manager", error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, role: user.role, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
});

router.get(
  "/store-managers",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const managers = await User.find({ role: "store-manager" }).select(
        "_id name email"
      );
      res.json({ managers });
    } catch (error) {
      console.error("Failed to fetch store managers:", error);
      res.status(500).json({ error: "Failed to fetch store managers" });
    }
  }
);

router.post(
  "/analytics/walkins",
  authenticateToken,
  authorizeRoles("store-manager"),
  async (req: Request, res: Response) => {
    try {
      const { estimatedCustomerCount, timestamp } = req.body;
      const storeId = req.user?.store;

      if (!storeId) {
        return res.status(400).json({ error: "Store not found for user." });
      }

      if (typeof estimatedCustomerCount !== "number") {
        return res.status(400).json({ error: "Invalid customer count." });
      }

      const log = await WalkInLog.create({
        store: storeId,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        estimatedCustomerCount,
      });

      res.status(201).json(log);
    } catch (err) {
      console.error("Walk-in log error:", err);
      res.status(500).json({ error: "Failed to create walk-in log." });
    }
  }
);

router.get("/analytics/walkins", authenticateToken, async (req, res) => {
  try {
    let logs;

    if (req.user?.role === "admin") {
      logs = await WalkInLog.find()
        .populate({ path: "store", select: "name" })
        .sort({ timestamp: -1 })
        .limit(100);
    } else if (req.user?.role === "store-manager") {
      logs = await WalkInLog.find({ store: req.user.store })
        .populate({ path: "store", select: "name" })
        .sort({ timestamp: -1 })
        .limit(100);
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ walkInLogs: logs });
  } catch (err) {
    console.error("Error fetching walk-in logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
