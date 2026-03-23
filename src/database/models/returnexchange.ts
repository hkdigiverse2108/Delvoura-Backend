import mongoose from "mongoose";

export type ReturnExchange = {
  question: string;
  answer: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

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
