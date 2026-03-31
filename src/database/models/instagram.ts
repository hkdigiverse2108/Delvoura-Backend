import mongoose from "mongoose";
import { INSTAGRAM_MEDIA_TYPES } from "../../common/enum";
import type { Instagram } from "../../types";

const instagramSchema = new mongoose.Schema<Instagram>(
  {
    type: { type: String, enum: [INSTAGRAM_MEDIA_TYPES.IMG, INSTAGRAM_MEDIA_TYPES.VIDEO], required: true },
    imageUrl: { type: String, default: null },
    link: { type: String, required: true },
    videoUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const instagramModel = mongoose.model<Instagram>("instagram", instagramSchema, "instagram");
