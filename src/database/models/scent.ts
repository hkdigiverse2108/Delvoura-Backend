import mongoose from "mongoose";
import type { Scent } from "../../types";

const scentSchema = new mongoose.Schema<Scent>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const scentModel = mongoose.model<Scent>("scent", scentSchema, "scent");
