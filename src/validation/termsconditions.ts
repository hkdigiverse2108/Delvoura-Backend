import Joi from "joi";

export const addEditTermsConditionsSchema = Joi.object({
  content: Joi.string().required(),
});
