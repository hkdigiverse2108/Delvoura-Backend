import mongoose from "mongoose";

export type Newsletter = {
  email: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const newsletterSchema = new mongoose.Schema<Newsletter>(
  {
    email: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const newsletterModel = mongoose.model<Newsletter>("newsletter", newsletterSchema, "newsletter");
