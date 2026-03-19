import Joi from "joi";

export const addEditTopbarSchema = Joi.object({
  topbarItems: Joi.array().items(Joi.string().required()).min(1).optional(),
  isActive: Joi.boolean().optional(),
});
