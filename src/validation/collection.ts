import Joi from "joi";

export const createCollectionSchema = Joi.object({
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateCollectionSchema = Joi.object({
  name: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
