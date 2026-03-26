import Joi from "joi";

export const createInstagramSchema = Joi.object({
  imageUrl: Joi.string().required(),
  link: Joi.string().required(),
  videoUrl: Joi.string().allow(null, "").optional(),
  isActive: Joi.boolean().optional(),
});

export const updateInstagramSchema = Joi.object({
  instagramId: Joi.string().required(),
  imageUrl: Joi.string().required(),
  link: Joi.string().required(),
  videoUrl: Joi.string().allow(null, "").optional(),
  isActive: Joi.boolean().optional(),
});

export const deleteInstagramSchema = Joi.object({
  id: Joi.string().required(),
});

export const getInstagramByIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const getInstagramsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});

export const addEditInstagramSchema = Joi.object({
  instagramId: Joi.string().optional(),
  imageUrl: Joi.string().required(),
  link: Joi.string().required(),
  videoUrl: Joi.string().allow(null, "").optional(),
  isActive: Joi.boolean().optional(),
});
