import mongoose from "mongoose";

export type Ingredient = {
  name: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const ingredientSchema = new mongoose.Schema<Ingredient>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ingredientModel = mongoose.model<Ingredient>("ingredient", ingredientSchema, "ingredient");
