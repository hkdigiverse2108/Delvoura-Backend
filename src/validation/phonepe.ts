import Joi from "joi";

export const createPhonePePaymentSchema = Joi.object({
  merchantOrderId: Joi.string().optional(),
  amount: Joi.number().required(),
  amountUnit: Joi.string().trim().uppercase().valid("PAISE", "RUPEES").optional(),
  expireAfter: Joi.number().optional(),
  redirectUrl: Joi.string().uri().optional(),
  callbackUrl: Joi.string().uri().optional(),
  message: Joi.string().optional(),
  metaInfo: Joi.object({
    udf1: Joi.string().optional(),
    udf2: Joi.string().optional(),
    udf3: Joi.string().optional(),
    udf4: Joi.string().optional(),
    udf5: Joi.string().optional(),
  }).optional(),
});

export const phonePeOrderStatusSchema = Joi.object({
  merchantOrderId: Joi.string().required(),
});

export const phonePeRefundSchema = Joi.object({
  merchantRefundId: Joi.string().required(),
  originalMerchantOrderId: Joi.string().required(),
  amount: Joi.number().required(),
  amountUnit: Joi.string().trim().uppercase().valid("PAISE", "RUPEES").optional(),
});

export const phonePeRefundStatusSchema = Joi.object({
  merchantRefundId: Joi.string().required(),
});
