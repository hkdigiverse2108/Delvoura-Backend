import Joi from "joi";

export const createIngredientSchema = Joi.object({
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateIngredientSchema = Joi.object({
  ingredientId: Joi.string().required(),
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const deleteIngredientSchema = Joi.object({
  id: Joi.string().required(),
});

export const getIngredientsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
