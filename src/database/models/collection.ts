import mongoose from "mongoose";
import type { Collection } from "../../types";

const collectionSchema = new mongoose.Schema<Collection>(
  {
    name: { type: String, required: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const collectionModel = mongoose.model<Collection>("collection", collectionSchema, "collection");
