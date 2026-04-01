import Joi from "joi";

export const createRatingSchema = Joi.object({
  productId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  description: Joi.string().optional(),
  starRating: Joi.number().min(1).max(5).required(),
});

export const updateRatingSchema = Joi.object({
  ratingId: Joi.string().required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  description: Joi.string().optional(),
  starRating: Joi.number().min(1).max(5).optional(),
});

export const deleteRatingSchema = Joi.object({
  id: Joi.string().required(),
});

export const getRatingsSchema = Joi.object({
  productId: Joi.string().optional(),
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
