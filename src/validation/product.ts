import Joi from "joi";
import { PRODUCT_GENDERS, PRODUCT_SEASONS } from "../common";

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  title: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  price: Joi.number().optional(),
  mrp: Joi.number().optional(),
  season: Joi.string().valid(...Object.values(PRODUCT_SEASONS)).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  categoryId: Joi.string().optional(),
  collectionId: Joi.string().optional(),
  variant: Joi.string().optional(),
  ingredientId: Joi.string().optional(),
  description: Joi.string().optional(),
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
  season: Joi.string().valid(...Object.values(PRODUCT_SEASONS)).optional(),
  gender: Joi.string().valid(...Object.values(PRODUCT_GENDERS)).optional(),
  categoryId: Joi.string().optional(),
  collectionId: Joi.string().optional(),
  variant: Joi.string().optional(),
  ingredientId: Joi.string().optional(),
  description: Joi.string().optional(),
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
  categoryId: Joi.string().optional(),
  collectionId: Joi.string().optional(),
  ingredientId: Joi.string().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
