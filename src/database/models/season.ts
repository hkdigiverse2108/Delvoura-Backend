import mongoose from "mongoose";
import type { Season } from "../../types";

const seasonSchema = new mongoose.Schema<Season>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const seasonModel = mongoose.model<Season>("season", seasonSchema, "season");
