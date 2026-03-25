import mongoose from "mongoose";
import type { ReturnExchange } from "../../types";

const returnExchangeSchema = new mongoose.Schema<ReturnExchange>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const returnExchangeModel = mongoose.model<ReturnExchange>("returnexchange", returnExchangeSchema, "returnexchange");
