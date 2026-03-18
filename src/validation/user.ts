import Joi from "joi";
import { USER_ROLES } from "../common";
import { phoneSchema } from "./auth";

export const updateUserSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  contact: phoneSchema.optional(),
  roles: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.USER).optional(),
  role: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.USER).optional(),
  isActive: Joi.boolean().optional(),
})

export const deleteUserSchema = Joi.object({
  id: Joi.string().required(),
})

export const getUsersSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
})
