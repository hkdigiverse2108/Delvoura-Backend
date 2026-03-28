import Joi from "joi";

export const addEditTermsServiceSchema = Joi.object({
  content: Joi.string().required(),
});
