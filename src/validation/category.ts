import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
})

export const updateCategorySchema = Joi.object({
  categoryId: Joi.string().required(),
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
})

export const deleteCategorySchema = Joi.object({
  id: Joi.string().required(),
})

export const getCategoriesSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
})
