import mongoose from "mongoose";

export type PrivacyPolicy = {
  title: string;
  content: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const privacyPolicySchema = new mongoose.Schema<PrivacyPolicy>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const privacyPolicyModel = mongoose.model<PrivacyPolicy>("privacypolicy", privacyPolicySchema, "privacypolicy");
