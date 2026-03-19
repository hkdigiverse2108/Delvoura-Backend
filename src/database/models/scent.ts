import mongoose from "mongoose";

export type Scent = {
  name: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const scentSchema = new mongoose.Schema<Scent>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const scentModel = mongoose.model<Scent>("scent", scentSchema, "scent");
