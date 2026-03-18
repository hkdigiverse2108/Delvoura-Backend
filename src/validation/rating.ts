import Joi from "joi";

export const createRatingSchema = Joi.object({
  productId: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  userImage: Joi.string().optional(),
  description: Joi.string().optional(),
  starRating: Joi.number().min(1).max(5).required(),
});

export const updateRatingSchema = Joi.object({
  ratingId: Joi.string().required(),
  username: Joi.string().optional(),
  email: Joi.string().email().optional(),
  userImage: Joi.string().optional(),
  description: Joi.string().optional(),
  starRating: Joi.number().min(1).max(5).optional(),
});

export const deleteRatingSchema = Joi.object({
  id: Joi.string().required(),
});

export const getRatingsSchema = Joi.object({
  productId: Joi.string().required(),
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
