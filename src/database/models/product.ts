import mongoose from "mongoose";
import { PRODUCT_GENDERS, PRODUCT_SEASONS } from "../../common";

export type Product = {
  name: string;
  title?: string;
  images?: string[];
  price?: number;
  mrp?: number;
  season?: string;
  gender?: string;
  categoryId?: mongoose.Types.ObjectId;
  collectionId?: mongoose.Types.ObjectId;
  variant?: string;
  ingredientId?: mongoose.Types.ObjectId;
  description?: string;
  isTrending?: boolean;
  brandName?: string;
  brandInfo?: string;
  manufacturerName?: string;
  manufacturerInfo?: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const productSchema = new mongoose.Schema<Product>(
  {
    name: { type: String, required: true },
    title: { type: String },
    images: [{ type: String }],
    price: { type: Number },
    mrp: { type: Number },
    season: { type: String, enum: Object.values(PRODUCT_SEASONS), default: PRODUCT_SEASONS.ALL_WEATHER },
    gender: { type: String, enum: Object.values(PRODUCT_GENDERS), default: PRODUCT_GENDERS.UNISEX },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "collection" },
    variant: { type: String },
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "ingredient" },
    description: { type: String },
    isTrending: { type: Boolean, default: false },
    brandName: { type: String },
    brandInfo: { type: String },
    manufacturerName: { type: String },
    manufacturerInfo: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const productModel = mongoose.model<Product>("product", productSchema, "product");
