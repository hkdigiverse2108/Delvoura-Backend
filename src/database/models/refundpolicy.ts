import mongoose from "mongoose";

export type RefundPolicy = {
  title: string;
  content: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const refundPolicySchema = new mongoose.Schema<RefundPolicy>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const refundPolicyModel = mongoose.model<RefundPolicy>("refundpolicy", refundPolicySchema, "refundpolicy");
