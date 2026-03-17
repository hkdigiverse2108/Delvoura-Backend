import Joi from "joi";
import { USER_ROLES } from "../common";
import { phoneSchema } from "./auth";

export const adminUpdateUserSchema = Joi.object({
  name: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  phoneNo: phoneSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  roles: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.USER).optional(),
  role: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.USER).optional(),
  isActive: Joi.boolean().optional(),
}).options({ abortEarly: true, allowUnknown: true });
