import mongoose from "mongoose";
import type { TermsService } from "../../types";

const termsServiceSchema = new mongoose.Schema<TermsService>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const termsServiceModel = mongoose.model<TermsService>("termsservice", termsServiceSchema, "termsservice");
