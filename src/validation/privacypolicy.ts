import Joi from "joi";

export const addEditPrivacyPolicySchema = Joi.object({
  content: Joi.string().required(),
});
