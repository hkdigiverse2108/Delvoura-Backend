import Joi from "joi";

export const createTermsConditionsSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateTermsConditionsSchema = Joi.object({
  termsConditionsId: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const deleteTermsConditionsSchema = Joi.object({
  id: Joi.string().required(),
});

export const getTermsConditionsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
