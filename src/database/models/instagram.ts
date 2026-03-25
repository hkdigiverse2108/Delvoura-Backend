import mongoose from "mongoose";
import type { Instagram } from "../../types";

const instagramSchema = new mongoose.Schema<Instagram>(
  {
    imageUrl: { type: String, required: true },
    link: { type: String, required: true },
    videoUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const instagramModel = mongoose.model<Instagram>("instagram", instagramSchema, "instagram");
