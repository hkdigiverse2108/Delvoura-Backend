import Joi from "joi";

export const createReturnExchangeSchema = Joi.object({
  question: Joi.string().required(),
  answer: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateReturnExchangeSchema = Joi.object({
  returnExchangeId: Joi.string().required(),
  question: Joi.string().required(),
  answer: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const deleteReturnExchangeSchema = Joi.object({
  id: Joi.string().required(),
});

export const getReturnExchangesSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
