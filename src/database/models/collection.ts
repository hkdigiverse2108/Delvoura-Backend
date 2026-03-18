import mongoose from "mongoose";

export type Collection = {
  name: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const collectionSchema = new mongoose.Schema<Collection>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const collectionModel = mongoose.model<Collection>("collection", collectionSchema, "collection");
