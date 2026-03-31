import Joi from "joi";

export const createContactUsSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  countryCode: Joi.string().allow("", null).optional(),
  phone: Joi.string().allow("", null).optional(),
  message: Joi.string().required(),
});


export const deleteContactUsSchema = Joi.object({
  id: Joi.string().required(),
});

export const getContactUsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ReadFilter: Joi.boolean().optional(),
  status: Joi.string().valid("read", "unread").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
