import mongoose from "mongoose";
import type { Newsletter } from "../../types";

const newsletterSchema = new mongoose.Schema<Newsletter>(
  {
    email: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const newsletterModel = mongoose.model<Newsletter>("newsletter", newsletterSchema, "newsletter");
