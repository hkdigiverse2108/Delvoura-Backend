import type mongoose from "mongoose";

export type Product = {
  name: string;
  title?: string;
  images?: string[];
  coverimage?: string;
  mrp?: number;
  seasonIds?: mongoose.Types.ObjectId[];
  gender?: string;
  collectionIds?: mongoose.Types.ObjectId[];
  variants?: {
    size: string;
    price?: number;
  }[];
  ingredients?: string[];
  description?: string;
  scentIds?: mongoose.Types.ObjectId[];
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
