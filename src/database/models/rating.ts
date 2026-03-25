import mongoose from "mongoose";
import type { Rating } from "../../types";

const ratingSchema = new mongoose.Schema<Rating>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String },
    starRating: { type: Number, required: true, min: 1, max: 5 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ratingModel = mongoose.model<Rating>("rating", ratingSchema, "rating");
