import Joi from "joi";

export const createCollectionSchema = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const updateCollectionSchema = Joi.object({
  collectionId: Joi.string().required(),
  name: Joi.string().required(),
  image: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const deleteCollectionSchema = Joi.object({
  id: Joi.string().required(),
});

export const getCollectionsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
