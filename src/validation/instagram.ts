import Joi from "joi";

export const addEditInstagramSchema = Joi.object({
  imageUrl: Joi.string().optional(),
  link: Joi.string().required(),
  videoUrl: Joi.string().allow(null, "").optional(),
  isActive: Joi.boolean().optional(),
});
