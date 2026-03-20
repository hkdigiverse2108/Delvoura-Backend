import mongoose from "mongoose";
import { PRODUCT_GENDERS } from "../../common";

export type Product = {
  name: string;
  title?: string;
  images?: string[];
  coverimage?: string;
  price?: number;
  mrp?: number;
  seasonIds?: mongoose.Types.ObjectId[];
  gender?: string;
  collectionIds?: mongoose.Types.ObjectId[];
  variants?: string[];
  ingredients?: string[];
  description?: string;
  scentIds?: string[];
  usageTips?: string;
  scentStory?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;
  isTrending?: boolean;
  brandManufacturerInfo?: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const productSchema = new mongoose.Schema<Product>(
  {
    name: { type: String, required: true },
    title: { type: String },
    images: [{ type: String }],
    coverimage: { type: String },
    price: { type: Number },
    mrp: { type: Number },
    seasonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "season" }],
    gender: { type: String, enum: Object.values(PRODUCT_GENDERS), default: PRODUCT_GENDERS.UNISEX },
    collectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "collection" }],
    variants: [{ type: String }],
    ingredients: [{ type: String }],
    description: { type: String },
    scentIds: [{ type: String }],
    usageTips: { type: String },
    scentStory: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    slug: { type: String },
    brandManufacturerInfo: { type: String },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const productModel = mongoose.model<Product>("product", productSchema, "product");
