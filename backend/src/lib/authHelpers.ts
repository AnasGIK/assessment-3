import { generateToken } from "../middlewares/middlewares";
import { User } from "../models/models";

// Login/Register Helper Functions
export const authHelpers = {
  // Register new user
  registerUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    storeId?: string;
  }) => {
    try {
      const {
        name,
        email,
        password,
        role = "StoreManager",
        storeId,
      } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // Create user object
      const userObj: any = { name, email, password, role };

      // Add store reference for StoreManager
      if (role === "StoreManager" && storeId) {
        userObj.store = storeId;
      }

      const user = new User(userObj);
      await user.save();

      // Generate token
      const token = generateToken(user._id!.toString(), user.role);

      return {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          store: user.store,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Login user
  loginUser: async (email: string, password: string) => {
    try {
      // Find user
      const user = await User.findOne({ email })
        .select("+password")
        .populate("store");
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Generate token
      const token = generateToken(user._id!.toString(), user.role);

      return {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          store: user.store,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
