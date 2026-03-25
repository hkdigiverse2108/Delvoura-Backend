import Joi from "joi";
import { PRODUCT_GENDERS } from "../common";

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  title: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  coverimage: Joi.string().optional(),
  mrp: Joi.number().optional(),
  seasonId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  seasonIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  collectionId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  collectionIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  variants: Joi.array().items(Joi.object({size: Joi.string().required(),price: Joi.number().optional(),})).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
  scentId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  scentIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  usageTips: Joi.string().optional(),
  scentStory: Joi.string().optional(),
  metaTitle: Joi.string().optional(),
  metaDescription: Joi.string().optional(),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
  slug: Joi.string().optional(),
  isTrending: Joi.boolean().optional(),
  brandManufacturerInfo: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  title: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  coverimage: Joi.string().optional(),
  mrp: Joi.number().optional(),
  seasonId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  seasonIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  collectionId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  collectionIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  variants: Joi.array().items(Joi.string()).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
  scentId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  scentIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  usageTips: Joi.string().optional(),
  scentStory: Joi.string().optional(),
  metaTitle: Joi.string().optional(),
  metaDescription: Joi.string().optional(),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
  slug: Joi.string().optional(),
  isTrending: Joi.boolean().optional(),
  brandManufacturerInfo: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const deleteProductSchema = Joi.object({
  id: Joi.string().required(),
});

export const getProductByIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const getProductsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  sortByFilter: Joi.string().valid("nameASC", "nameDESC", "newest", "oldest", "priceASC", "priceDESC").optional(),
  collectionFilter: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  seasonFilter: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  scentFilter: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  genderFilter: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  TrendingFilter: Joi.boolean().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
