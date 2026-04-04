import { apiResponse, getPaginationState, HTTP_STATUS, isValidObjectId, parseDateRange, resolvePagination, USER_ROLES } from "../../common";
import { addressModel, orderModel, productModel, userModel } from "../../database";
import { countData, createData, getData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData, updateMany } from "../../helper";
import { createOrderSchema, getOrderByIdSchema, getOrdersSchema, updateOrderShippingAddressSchema } from "../../validation";

const userProjection = { password: 0, otp: 0, otpExpireTime: 0, __v: 0 };

const resolveOrderEmail = (order: any) => {
  if (!order) return "";
  const raw = order.email || order.contactEmail;
  return raw ? String(raw).toLowerCase() : "";
};

const normalizeShippingAddress = (shippingAddress: any) => {
  const normalized = Array.isArray(shippingAddress) ? shippingAddress : [shippingAddress];
  if (!normalized.length) return normalized;

  const hasDefault = normalized.some((address) => address?.default === true);
  if (!hasDefault) return normalized;

  let defaultSet = false;
  return normalized.map((address) => {
    if (address?.default === true && !defaultSet) {
      defaultSet = true;
      return { ...address, default: true };
    }
    return { ...address, default: false };
  });
};

const createOrderWithUniqueOrderId = async (payload: any, maxRetries = 5) => {
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      return await createData(orderModel, payload);
    } catch (error: any) {
      const duplicateOrderId = error?.code === 11000 && error?.keyPattern?.orderId;
      if (!duplicateOrderId || attempt === maxRetries - 1) throw error;
    }
  }

  throw new Error("Unable to generate unique orderId");
};

export const createOrder = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createOrderSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const rawEmail = value.email || value.contactEmail;
    const emailValue = rawEmail ? String(rawEmail).toLowerCase() : "";

    if (!emailValue) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidEmail, {}, {}));

    value.email = emailValue;
    if ("contactEmail" in value) delete value.contactEmail;

    const authUser = req?.headers?.user as any;

    if (!value.addressId && (!value.shippingAddress || value.shippingAddress.length === 0)) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, "Shipping address is required", {}, {}));

    if (value.addressId) {
      const addressId = isValidObjectId(value.addressId);
      if (!addressId) { return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Address"), {}, {})); }

      if (!authUser?._id) { return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidToken, {}, {})); }
      const address = await getFirstMatch(addressModel, { _id: addressId, isDeleted: false }, {}, {});

      if (!address) { return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Address"), {}, {})); }

      if (String(address.userId) !== String(authUser._id)) { return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.accessDenied, {}, {})); }

      value.addressId = addressId;
      value.shippingAddress = [
        {
          country: address.country,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          state: address.state,
          pinCode: address.pinCode,
          default: Boolean(address.isDefault),
        },
      ];
    }

    if (value.shippingAddress) {
      value.shippingAddress = normalizeShippingAddress(value.shippingAddress);
    }

    const incomingUserId = value.userId || authUser?._id;

    if (incomingUserId) {
      const userId = isValidObjectId(incomingUserId);
      if (!userId) { return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("User"), {}, {})); }

      const userExists = await getFirstMatch(userModel, { _id: userId, isDeleted: false }, {}, {});

      if (!userExists) { return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("User"), {}, {})); }

      value.userId = userId;
    } else {
      const existingUser = await getFirstMatch(userModel, { email: emailValue, isDeleted: false }, {}, {});

      if (existingUser) {
        value.userId = existingUser._id;
      } else {
        const phoneRaw = value?.phone;
        const phoneNumber = phoneRaw
          ? Number(String(phoneRaw).replace(/[^0-9]/g, ""))
          : undefined;

        const createdUser = await createData(userModel, {
          email: emailValue,
          firstName: value?.firstName,
          lastName: value?.lastName,
          roles: USER_ROLES.USER,
          isActive: true,
          isDeleted: false,
          ...(phoneNumber ? { contact: { phoneNo: phoneNumber } } : {}),
        });

        value.userId = createdUser?._id;
      }
    }
    const rawProductIds = (value.items || []).map((item: any) => item.productId);
    const uniqueProductIds = Array.from(new Set(rawProductIds));

    if (uniqueProductIds.length > 0) {
      const validProductIds = uniqueProductIds.map((id) => isValidObjectId(String(id)));

      if (validProductIds.some((id) => !id)) { return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Product"), {}, {})); }

      const products = await getData(productModel, { _id: { $in: validProductIds }, isDeleted: false }, {name:1, price:1, image:1}, {});

      if (products.length !== validProductIds.length) { return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {})); }
    }
    if (!value.addressId && value.shippingAddress && value.userId) {
      const normalizedShipping = normalizeShippingAddress(value.shippingAddress);
      const shippingList = Array.isArray(normalizedShipping) ? normalizedShipping : [normalizedShipping];
      const addressSource = shippingList.find((address) => address?.default === true) || shippingList[0];

      if (addressSource) {
        let isDefault = Boolean(addressSource.default);
        if (!isDefault) {
          const existingCount = await countData(addressModel, { userId: value.userId, isDeleted: false });
          if (existingCount === 0) isDefault = true;
        }

        if (isDefault) {
          await updateMany(addressModel, { userId: value.userId, isDeleted: false }, { isDefault: false }, {});
        }

        const createdAddress = await createData(addressModel, {
          userId: value.userId,
          country: addressSource.country,
          address1: addressSource.address1,
          address2: addressSource.address2 ?? "",
          city: addressSource.city,
          state: addressSource.state,
          pinCode: addressSource.pinCode,
          isDefault,
          isActive: true,
          isDeleted: false,
        });

        if (createdAddress?._id) {
          value.addressId = createdAddress._id;
        }
      }
    }

    let subtotal = 0;

    (value.items || []).forEach((item: any) => {subtotal += Number(item.price) * Number(item.quantity);});

    value.subtotal = subtotal;
    value.total = subtotal;

    const response = await createOrderWithUniqueOrderId(value);
    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Order"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getOrders = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getOrdersSchema.validate(req.query) as { error: any; value: any };
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter, orderStatus, paymentStatus } = value;
    let criteria: any = { isDeleted: false }, options: any = { lean: true, sort: { createdAt: -1 } };

    const authUser = req?.headers?.user as any;
    const isAdmin = authUser?.roles === USER_ROLES.ADMIN;
    if (!isAdmin) {
      const ownerOr: any[] = [];
      if (authUser?._id) ownerOr.push({ userId: authUser._id });

      const authEmail = authUser?.email ? String(authUser.email).toLowerCase() : "";
      if (authEmail) {ownerOr.push({ email: authEmail }, { contactEmail: authEmail });}

      if (!ownerOr.length) {return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.accessDenied, {}, {}));}
      
      criteria.$and = criteria.$and ? [...criteria.$and, { $or: ownerOr }] : [{ $or: ownerOr }];
    }

    if (search) {
      criteria.$or = [
        { orderId: { $regex: search, $options: "si" } },
        { email: { $regex: search, $options: "si" } },
        { firstName: { $regex: search, $options: "si" } },
        { lastName: { $regex: search, $options: "si" } },
        { phone: { $regex: search, $options: "si" } },
      ];
    }

    if (orderStatus) criteria.orderStatus = orderStatus;
    if (paymentStatus) criteria.paymentStatus = paymentStatus;

    const dateRange = parseDateRange(startDateFilter, endDateFilter);
    if (startDateFilter && endDateFilter && !dateRange) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Invalid date filter"), {}, {}));
    
    if (dateRange) criteria.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    

    const { page: pageValue, limit: limitValue, skip, hasLimit } = resolvePagination(page, limit);
    if (hasLimit) {
      options.skip = skip;
      options.limit = limitValue;
    }

  const response = await orderModel
  .find(criteria)
  .populate("items.productId", "name price image")
  .sort({ createdAt: -1 })
  .lean();
    const totalCount = await countData(orderModel, criteria);

    const enrichedOrders = await attachUsersToOrders(response);
    // 🔥 all product ids collect
const productIds: any[] = [];

enrichedOrders.forEach((order: any) => {
  order.items?.forEach((item: any) => {
    if (item.productId) productIds.push(item.productId);
  });
});

const uniqueProductIds = [...new Set(productIds)];

const products = await getData(
  productModel,
  { _id: { $in: uniqueProductIds }, isDeleted: false },
  { name: 1, price: 1, image: 1 },
  {}
);

const productMap = new Map();
products.forEach((p: any) => {
  productMap.set(String(p._id), p);
});

enrichedOrders.forEach((order: any) => {
  order.items = order.items?.map((item: any) => ({
    ...item,
    product: productMap.get(String(item.productId)) || null
  }));
});
    const stateObj = getPaginationState(totalCount, pageValue, limitValue);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Orders"), { order_data: enrichedOrders, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getOrderById = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getOrderByIdSchema.validate(req.params) as { error: any; value: any };
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const orderId = isValidObjectId(value.id);
    if (!orderId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Order"), {}, {}));

    const order = await getFirstMatch(orderModel, { _id: orderId, isDeleted: false }, {}, {});
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Order"), {}, {}));

    const authUser = req?.headers?.user as any;
    const isAdmin = authUser?.roles === USER_ROLES.ADMIN;
    if (!isAdmin) {
      const authEmail = authUser?.email ? String(authUser.email).toLowerCase() : "";
      const ownerMatch = authUser?._id && order?.userId && String(order.userId) === String(authUser._id);
      const emailMatch = authEmail && authEmail === resolveOrderEmail(order);

      if (!ownerMatch && !emailMatch) {return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.accessDenied, {}, {}));}
    }

    const enrichedOrder = await attachUserToOrder(order);
    // 🔥 product ids collect karo
const productIds = (enrichedOrder.items || []).map((item: any) => item.productId);

// products fetch karo
const products = await getData(
  productModel,
  { _id: { $in: productIds }, isDeleted: false },
  { name: 1, price: 1, image: 1 },
  {}
);

// map create karo
const productMap = new Map();
products.forEach((p: any) => {
  productMap.set(String(p._id), p);
});

// items me product attach karo
enrichedOrder.items = enrichedOrder.items.map((item: any) => ({
  ...item,
  product: productMap.get(String(item.productId)) || null
}));

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Order"), enrichedOrder, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateOrderShippingAddress = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateOrderShippingAddressSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const orderId = isValidObjectId(value.orderId);
    if (!orderId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Order"), {}, {}));

    const order = await getFirstMatch(orderModel, { _id: orderId, isDeleted: false }, {}, {});
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Order"), {}, {}));

    const authUser = req?.headers?.user as any;
    if (authUser?._id && order?.userId && String(order.userId) !== String(authUser._id)) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidToken, {}, {}));
    

    const normalizedShipping = normalizeShippingAddress(value.shippingAddress);
    const updated = await updateData(orderModel, { _id: orderId }, { shippingAddress: normalizedShipping }, {});

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Order"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

const attachUserToOrder = async (order: any) => {
  if (!order) return order;

  let user = null;
  if (order.userId) {
    user = await getFirstMatch(userModel, { _id: order.userId, isDeleted: false }, userProjection, {});
  } else {
    const email = resolveOrderEmail(order);
    if (email) {
      user = await getFirstMatch(userModel, { email, isDeleted: false }, userProjection, {});
    }
  }

  return { ...order, user: user || null };
};

const attachUsersToOrders = async (orders: any[]) => {
  if (!orders?.length) return [];

  const userIds = Array.from(new Set(orders.map((order) => order?.userId).filter(Boolean).map((id) => String(id))));
  const emails = Array.from(new Set(orders.filter((order) => !order?.userId).map((order) => resolveOrderEmail(order)).filter(Boolean)));

  const userById = new Map<string, any>();
  const userByEmail = new Map<string, any>();

  if (userIds.length > 0) {
    const users = await getData(userModel, { _id: { $in: userIds }, isDeleted: false }, userProjection, {});
    users.forEach((user: any) => {
      userById.set(String(user?._id), user);
    });
  }

  if (emails.length > 0) {
    const users = await getData(userModel, { email: { $in: emails }, isDeleted: false }, userProjection, {});
    users.forEach((user: any) => {
      userByEmail.set(String(user?.email).toLowerCase(), user);
    });
  }

  return orders.map((order) => {
    const user = order?.userId
      ? userById.get(String(order.userId))
      : userByEmail.get(resolveOrderEmail(order));

    return { ...order, user: user || null };
  });
};
