import Joi from "joi";

export const addEditSettingsSchema = Joi.object({
  logo: Joi.string().optional(),
  razorpayKey: Joi.string().optional(),
  razorpaySecret: Joi.string().optional(),
  phonepeKey: Joi.string().optional(),
  phonepeSecret: Joi.string().optional(),
  enrolledLearners: Joi.number().optional(),
  classCompleted: Joi.number().optional(),
  satisfactionRate: Joi.number().optional(),
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
