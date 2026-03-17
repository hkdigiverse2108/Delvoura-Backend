import Joi from "joi";

export const phoneSchema = Joi.alternatives().try(
  Joi.string(),
  Joi.number(),
  Joi.object({
    countryCode: Joi.string().optional(),
    phoneNo: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    number: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  })
);

export const signupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  countryCode: Joi.string().allow("").optional(),
  phoneNo: phoneSchema.optional(),
}).options({ abortEarly: true, allowUnknown: true });

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).options({ abortEarly: true, allowUnknown: true });

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
}).options({ abortEarly: true, allowUnknown: true });

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
}).options({ abortEarly: true, allowUnknown: true });

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  password: Joi.string().min(6).required(),
}).options({ abortEarly: true, allowUnknown: true });

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
}).options({ abortEarly: true, allowUnknown: true });
