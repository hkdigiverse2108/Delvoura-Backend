import mongoose from "mongoose";

export type Category = {
  name: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const categorySchema = new mongoose.Schema<Category>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const categoryModel = mongoose.model<Category>("category", categorySchema, "category");
