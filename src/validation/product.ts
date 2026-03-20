import Joi from "joi";
import { PRODUCT_GENDERS } from "../common";

const scentNameSchema = Joi.string()
  .pattern(/^(?![a-fA-F0-9]{24}$).+/)
  .messages({ "string.pattern.base": "scentId must be a name, not an ObjectId" });

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  title: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  coverimage: Joi.string().optional(),
  price: Joi.number().optional(),
  mrp: Joi.number().optional(),
  seasonIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  collectionIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  variants: Joi.array().items(Joi.string()).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
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
  price: Joi.number().optional(),
  mrp: Joi.number().optional(),
  seasonIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  collectionId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  collectionIds: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  variants: Joi.array().items(Joi.string()).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
  scentId: Joi.alternatives().try(scentNameSchema, Joi.array().items(scentNameSchema)).optional(),
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
  collectionFilter: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  seasonFilter: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  scentFilter: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  isTrending: Joi.boolean().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
