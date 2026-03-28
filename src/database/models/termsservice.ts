import mongoose from "mongoose";
import type { TermsService } from "../../types";

const termsServiceSchema = new mongoose.Schema<TermsService>(
  {
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const termsServiceModel = mongoose.model<TermsService>("termsservice", termsServiceSchema, "termsservice");
