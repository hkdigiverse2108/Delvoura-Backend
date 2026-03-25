import Joi from "joi";

const shippingAddressSchema = Joi.object({
  country: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  company: Joi.string().allow("").optional(),
  address1: Joi.string().required(),
  address2: Joi.string().allow("").optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pinCode: Joi.string().required(),
  phone: Joi.string().required(),
});

const orderItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().required(),
});

export const createOrderSchema = Joi.object({
  userId: Joi.string().optional(),
  email: Joi.string().email().optional(),
  contactEmail: Joi.string().email().optional(),
  shippingAddress: shippingAddressSchema.required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  discountCode: Joi.string().optional(),
  subtotal: Joi.number().required(),
  shipping: Joi.number().optional(),
  tax: Joi.number().optional(),
  total: Joi.number().required(),
  currency: Joi.string().optional(),
  razorpayId: Joi.string().allow(null, "").optional(),
  phonePeId: Joi.string().allow(null, "").optional(),
  paymentStatus: Joi.string().optional(),
  orderStatus: Joi.string().optional(),
}).or("email", "contactEmail").options({ stripUnknown: true });

export const getOrdersSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  orderStatus: Joi.string().optional(),
  paymentStatus: Joi.string().optional(),
});

export const getOrderByIdSchema = Joi.object({
  id: Joi.string().required(),
});
