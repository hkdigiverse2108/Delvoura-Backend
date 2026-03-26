import Joi from "joi";

export const createRazorpayPaymentSchema = Joi.object({
  orderId: Joi.string().optional(),
  amount: Joi.when("orderId", {
    is: Joi.string().trim().min(1),
    then: Joi.number().optional(),
    otherwise: Joi.number().required(),
  }),
  amountUnit: Joi.string().trim().uppercase().valid("PAISE", "RUPEES").optional(),
  currency: Joi.string().optional(),
  receipt: Joi.string().optional(),
  payment_capture: Joi.number().valid(0, 1).optional(),
  paymentCapture: Joi.number().valid(0, 1).optional(),
  notes: Joi.object().optional(),
});

export const razorpayOrderStatusSchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
});

export const razorpayOrderStatusByOrderIdSchema = Joi.object({
  orderId: Joi.string().required(),
});

export const razorpayRefundSchema = Joi.object({
  paymentId: Joi.string().required(),
  amount: Joi.number().optional(),
  amountUnit: Joi.string().trim().uppercase().valid("PAISE", "RUPEES").optional(),
  speed: Joi.string().optional(),
  receipt: Joi.string().optional(),
  notes: Joi.object().optional(),
});

export const razorpayRefundStatusSchema = Joi.object({
  refundId: Joi.string().required(),
});

export const razorpayPaymentVerifySchema = Joi.object({
  razorpay_order_id: Joi.string().optional(),
  razorpayOrderId: Joi.string().optional(),
  razorpay_payment_id: Joi.string().optional(),
  razorpayPaymentId: Joi.string().optional(),
  razorpay_signature: Joi.string().optional(),
  razorpaySignature: Joi.string().optional(),
  orderId: Joi.string().optional(),
});
