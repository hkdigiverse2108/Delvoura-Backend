import Joi from "joi";
import { PRODUCT_GENDERS } from "../common";

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  title: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  price: Joi.number().optional(),
  mrp: Joi.number().optional(),
  seasonId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  collectionId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  variant: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
  scentId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  usageTips: Joi.string().optional(),
  scentStory: Joi.string().optional(),
  isTrending: Joi.boolean().optional(),
  brandName: Joi.string().optional(),
  brandInfo: Joi.string().optional(),
  manufacturerName: Joi.string().optional(),
  manufacturerInfo: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  title: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  price: Joi.number().optional(),
  mrp: Joi.number().optional(),
  seasonId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  collectionId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  variant: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
  scentId: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  usageTips: Joi.string().optional(),
  scentStory: Joi.string().optional(),
  isTrending: Joi.boolean().optional(),
  brandName: Joi.string().optional(),
  brandInfo: Joi.string().optional(),
  manufacturerName: Joi.string().optional(),
  manufacturerInfo: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const deleteProductSchema = Joi.object({
  id: Joi.string().required(),
});

export const getProductsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  collectionId: Joi.string().optional(),
  seasonId: Joi.string().optional(),
  scentId: Joi.string().optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
