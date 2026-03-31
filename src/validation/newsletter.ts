import Joi from "joi";

export const createNewsletterSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const deleteNewsletterSchema = Joi.object({
  id: Joi.string().required(),
});

export const getNewslettersSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
