import mongoose from "mongoose";

export type TermsConditions = {
  title: string;
  content: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

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
