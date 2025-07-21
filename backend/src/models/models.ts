import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "store-manager";
  store?: mongoose.Types.ObjectId;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IStore extends Document {
  name: string;
  category: string;
  floor: number;
  manager: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IWalkInLog extends Document {
  store: mongoose.Types.ObjectId;
  timestamp: Date;
  estimatedCustomerCount: number;
}

export interface ITelcoTrend extends Document {
  category: string;
  trendScore: number;
  recordedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    // required: [true, "Name is required"],
    // trim: true,
    // minlength: [2, "Name must be at least 2 characters"],
  },
  email: {
    type: String,
    // required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    // trim: true,
    // match: [
    //   /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please enter a valid email",
    // ],
  },
  password: {
    type: String,
    // required: [true, "Password is required"],
    // minlength: [6, "Password must be at least 6 characters"],
  },
  role: {
    type: String,
    enum: ["admin", "store-manager"],
    // required: [true, "Role is required"],
    default: "store-manager",
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    // required: function () {
    //   return this.role === "store-manager";
    // },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StoreSchema = new Schema<IStore>({
  name: {
    type: String,
    // required: [true, "Store name is required"],
    // trim: true,
    // minlength: [2, "Store name must be at least 2 characters"],
  },
  category: {
    type: String,
    // required: [true, "Category is required"],
    // trim: true,
    enum: [
      "fashion",
      "electronics",
      "lifestyle",
      "food",
      "entertainment",
      "other",
    ],
    lowercase: true,
  },
  floor: {
    type: Number,
    // required: [true, "Floor number is required"],
    // min: [1, "Floor must be at least 1"],
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Store manager is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WalkInLogSchema = new Schema<IWalkInLog>({
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store reference is required"],
  },
  timestamp: {
    type: Date,
    required: [true, "Timestamp is required"],
    default: Date.now,
  },
  estimatedCustomerCount: {
    type: Number,
    required: [true, "Customer count is required"],
    min: [0, "Customer count cannot be negative"],
  },
});

const TelcoTrendSchema = new Schema<ITelcoTrend>({
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    enum: [
      "fashion",
      "electronics",
      "lifestyle",
      "food",
      "entertainment",
      "other",
    ],
    lowercase: true,
  },
  trendScore: {
    type: Number,
    required: [true, "Trend score is required"],
    min: [0, "Trend score must be at least 0"],
    max: [100, "Trend score cannot exceed 100"],
  },
  recordedAt: {
    type: Date,
    required: [true, "Recording date is required"],
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.index({ email: 1 });
StoreSchema.index({ category: 1, floor: 1 });
WalkInLogSchema.index({ store: 1, timestamp: -1 });
TelcoTrendSchema.index({ category: 1, recordedAt: -1 });

export const User = mongoose.model<IUser>("User", UserSchema);
export const Store = mongoose.model<IStore>("Store", StoreSchema);
export const WalkInLog = mongoose.model<IWalkInLog>(
  "WalkInLog",
  WalkInLogSchema
);
export const TelcoTrend = mongoose.model<ITelcoTrend>(
  "TelcoTrend",
  TelcoTrendSchema
);
