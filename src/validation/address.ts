import Joi from "joi";

export const createAddressSchema = Joi.object({
  country: Joi.string().required(),
  address1: Joi.string().required(),
  address2: Joi.string().allow("").optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pinCode: Joi.string().required(),
  isDefault: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

export const updateAddressSchema = Joi.object({
  addressId: Joi.string().required(),
  country: Joi.string().optional(),
  address1: Joi.string().optional(),
  address2: Joi.string().allow("").optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  pinCode: Joi.string().optional(),
  isDefault: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

export const deleteAddressSchema = Joi.object({
  id: Joi.string().required(),
});

export const getAddressByIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const getAddressesSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});
