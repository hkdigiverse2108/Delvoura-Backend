import mongoose from "mongoose";
import type { RefundPolicy } from "../../types";

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
