import Joi from "joi";

export const createIngredientSchema = Joi.object({
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateIngredientSchema = Joi.object({
  name: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
