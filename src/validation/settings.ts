import Joi from "joi";

export const addEditSettingsSchema = Joi.object({
  logo: Joi.string().optional(),
  isRazorpay: Joi.boolean().optional(),
  razorpayApiKey: Joi.string().allow(null, "").optional(),
  razorpayApiSecret: Joi.string().allow(null, "").optional(),
  isPhonePe: Joi.boolean().optional(),
  phonePeApiKey: Joi.string().allow(null, "").optional(),
  phonePeApiSecret: Joi.string().allow(null, "").optional(),
  phonePeVersion: Joi.string().allow(null, "").optional(),
  link: Joi.string().allow(null, "").optional(),
  address: Joi.string().allow(null, "").optional(),
  phoneNumber: Joi.string().allow(null, "").optional(),
  email: Joi.string().email().allow(null, "").optional(),
  socialMediaLinks: Joi.object({
    facebook: Joi.string().allow(null, "").optional(),
    twitter: Joi.string().allow(null, "").optional(),
    instagram: Joi.string().allow(null, "").optional(),
    linkedin: Joi.string().allow(null, "").optional(),
  }).optional(),
});
