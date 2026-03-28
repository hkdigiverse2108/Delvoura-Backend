import Joi from "joi";

export const addEditReturnExchangeSchema = Joi.object({
  content: Joi.string().required(),
});
