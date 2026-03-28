import mongoose from "mongoose";
import { PRODUCT_GENDERS } from "../../common";
import type { Product } from "../../types";

const productSchema = new mongoose.Schema<Product>(
  {
    name: { type: String, required: true },
    title: { type: String },
    images: [{ type: String }],
    coverimage: { type: String },
    mrp: { type: Number },
    seasonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "season" }],
    gender: { type: String, enum: Object.values(PRODUCT_GENDERS), default: PRODUCT_GENDERS.UNISEX },
    collectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "collection" }],
    variants: [
      {
        size: { type: String, required: true },
        price: { type: Number },
        mrp: { type: Number }
      },
    ],
    ingredients: [{ type: String }],
    description: { type: String },
    scentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "scent" }],
    usageTips: { type: String },
    scentStory: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    slug: { type: String },
    brandManufacturerInfo: { type: String },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const productModel = mongoose.model<Product>("product", productSchema, "product");
