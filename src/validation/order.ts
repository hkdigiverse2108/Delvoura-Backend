import Joi from "joi";

const shippingAddressSchema = Joi.object({
  country: Joi.string().required(),
  address1: Joi.string().required(),
  address2: Joi.string().allow("").optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pinCode: Joi.string().required(),
  default: Joi.boolean().optional(),
});

const orderItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().required(),
});

export const createOrderSchema = Joi.object({
  userId: Joi.string().optional(),
  addressId: Joi.string().optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().optional(),
  contactEmail: Joi.string().email().optional(),
  phone: Joi.string().required(),
  shippingAddress: Joi.alternatives()
    .try(Joi.array().items(shippingAddressSchema).min(1), shippingAddressSchema)
    .optional(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  discountCode: Joi.string().optional(),
  subtotal: Joi.number().required(),
  total: Joi.number().required(),
  currency: Joi.string().optional(),
  razorpayId: Joi.string().allow(null, "").optional(),
  phonePeId: Joi.string().allow(null, "").optional(),
  paymentStatus: Joi.string().optional(),
  orderStatus: Joi.string().optional(),
}).or("email", "contactEmail").or("shippingAddress", "addressId").options({ stripUnknown: true });

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

export const updateOrderShippingAddressSchema = Joi.object({
  orderId: Joi.string().required(),
  shippingAddress: Joi.alternatives()
    .try(Joi.array().items(shippingAddressSchema).min(1), shippingAddressSchema)
    .required(),
});

