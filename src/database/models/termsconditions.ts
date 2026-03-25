import mongoose from "mongoose";
import type { TermsConditions } from "../../types";

const termsConditionsSchema = new mongoose.Schema<TermsConditions>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const termsConditionsModel = mongoose.model<TermsConditions>("termsconditions", termsConditionsSchema, "termsconditions");
