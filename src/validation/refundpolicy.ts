import Joi from "joi";

export const createRefundPolicySchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateRefundPolicySchema = Joi.object({
  refundPolicyId: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const deleteRefundPolicySchema = Joi.object({
  id: Joi.string().required(),
});

export const getRefundPoliciesSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
