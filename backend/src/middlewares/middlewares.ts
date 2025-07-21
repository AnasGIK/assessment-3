import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/models";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
const JWT_SECRET = String(process.env.JWT_SECRET);
const JWT_EXPIRE = String(process.env.JWT_EXPIRE);

export const generateToken = (userId: string, role: string): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  const payload = { userId, role };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12d" });
};

// Verify JWT Token Middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Invalid token. User not found.",
      });
    }

    // Check if token is expired (additional check)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({
        error: "Token expired",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(500).json({ error: "Authentication failed" });
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(
          " or "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Store ownership middleware (for StoreManager)
export const authorizeStoreAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admins can access any store
    if (req.user.role === "admin") {
      return next();
    }

    // StoreManager can only access their own store
    if (req.user.role === "store-manager") {
      const storeId = req.params.storeId || req.body.storeId;

      if (!storeId) {
        return res.status(400).json({ error: "Store ID required" });
      }

      // Check if the store belongs to this manager
      if (!req.user.store || req.user.store.toString() !== storeId) {
        return res.status(403).json({
          error: "Access denied. You can only access your own store data.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Store authorization error:", error);
    return res.status(500).json({ error: "Authorization failed" });
  }
};
