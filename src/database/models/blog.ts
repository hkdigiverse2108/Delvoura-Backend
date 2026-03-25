import mongoose from "mongoose";
import type { Blog } from "../../types";

const blogSchema = new mongoose.Schema<Blog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const blogModel = mongoose.model<Blog>("blog", blogSchema, "blog");
