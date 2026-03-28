import mongoose from "mongoose";
import type { PrivacyPolicy } from "../../types";

const privacyPolicySchema = new mongoose.Schema<PrivacyPolicy>(
  {
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const privacyPolicyModel = mongoose.model<PrivacyPolicy>("privacypolicy", privacyPolicySchema, "privacypolicy");
