import mongoose from "mongoose";

export type Banner = {
  bannerImages: string[];
  isActive?: boolean;
  isDeleted?: boolean;
};

const bannerSchema = new mongoose.Schema<Banner>(
  {
    bannerImages: [{ type: String, required: true }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const bannerModel = mongoose.model<Banner>("banner", bannerSchema, "banner");
