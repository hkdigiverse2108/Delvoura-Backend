import mongoose from "mongoose";

export type Rating = {
  productId: mongoose.Types.ObjectId;
  username: string;
  email: string;
  userImage?: string;
  description?: string;
  starRating: number;
  isDeleted?: boolean;
};

const ratingSchema = new mongoose.Schema<Rating>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    userImage: { type: String },
    description: { type: String },
    starRating: { type: Number, required: true, min: 1, max: 5 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ratingModel = mongoose.model<Rating>("rating", ratingSchema, "rating");
