import mongoose from "mongoose";
import { PRODUCT_GENDERS } from "../../common";

export type Product = {
  name: string;
  title?: string;
  images?: string[];
  coverimage?: string;
  price?: number;
  mrp?: number;
  seasonId?: mongoose.Types.ObjectId[];
  gender?: string;
  collectionId?: mongoose.Types.ObjectId[];
  variant?: string[];
  ingredient?: string[];
  description?: string;
  scentId?: mongoose.Types.ObjectId[];
  usageTips?: string;
  scentStory?: string;
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
    seasonId: [{ type: mongoose.Schema.Types.ObjectId, ref: "season" }],
    gender: { type: String, enum: Object.values(PRODUCT_GENDERS), default: PRODUCT_GENDERS.UNISEX },
    collectionId: [{ type: mongoose.Schema.Types.ObjectId, ref: "collection" }],
    variant: [{ type: String }],
    ingredient: [ { type: String }],
    description: { type: String },
    scentId: [{ type: mongoose.Schema.Types.ObjectId, ref: "scent" }],
    usageTips: { type: String },
    scentStory: { type: String },
    brandManufacturerInfo: { type: String },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const productModel = mongoose.model<Product>("product", productSchema, "product");
