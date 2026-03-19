import Joi from "joi";

export const createScentSchema = Joi.object({
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateScentSchema = Joi.object({
  scentId: Joi.string().required(),
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const deleteScentSchema = Joi.object({
  id: Joi.string().required(),
});

export const getScentsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
