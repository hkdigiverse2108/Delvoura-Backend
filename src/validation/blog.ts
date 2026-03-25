import Joi from "joi";

export const createBlogSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  image: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const updateBlogSchema = Joi.object({
  blogId: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  image: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

export const deleteBlogSchema = Joi.object({
  id: Joi.string().required(),
});

export const getBlogByIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const getBlogsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
