import Joi from "joi";

export const createSeasonSchema = Joi.object({
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateSeasonSchema = Joi.object({
  seasonId: Joi.string().required(),
  name: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const deleteSeasonSchema = Joi.object({
  id: Joi.string().required(),
});

export const getSeasonsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
