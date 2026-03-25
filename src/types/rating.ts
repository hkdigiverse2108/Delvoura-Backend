import type mongoose from "mongoose";

export type Rating = {
  productId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  description?: string;
  starRating: number;
  isDeleted?: boolean;
};
