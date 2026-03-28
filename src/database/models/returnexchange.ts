import mongoose from "mongoose";
import type { ReturnExchange } from "../../types";

const returnExchangeSchema = new mongoose.Schema<ReturnExchange>(
  {
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const returnExchangeModel = mongoose.model<ReturnExchange>("returnexchange", returnExchangeSchema, "returnexchange");
