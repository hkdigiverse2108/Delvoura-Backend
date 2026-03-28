import Joi from "joi";

export const addEditRefundPolicySchema = Joi.object({
  content: Joi.string().required(),
});
