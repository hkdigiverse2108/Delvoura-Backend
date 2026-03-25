import mongoose from "mongoose";
import type { Banner } from "../../types";

const bannerSchema = new mongoose.Schema<Banner>(
  {
    bannerImages: [{ type: String, required: true }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const bannerModel = mongoose.model<Banner>("banner", bannerSchema, "banner");
