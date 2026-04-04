import { apiResponse, getPaginationState, HTTP_STATUS, isValidObjectId, resolvePagination, USER_ROLES } from "../../common";
import { addressModel, orderModel, productModel, userModel } from "../../database";
import { countData, createData, getData, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createOrderSchema, getOrderByIdSchema, getOrdersSchema, updateOrderShippingAddressSchema } from "../../validation";

const normalizeShippingAddress = (shippingAddress: any) => {
  const normalized = Array.isArray(shippingAddress) ? shippingAddress : [shippingAddress];
  let hasDefault = false;

  return normalized.map((address: any) => {
    if (address?.default === true && !hasDefault) {
      hasDefault = true;
      return { ...address, default: true };
    }

    return { ...address, default: false };
  });
};

const createOrderWithRetry = async (payload: any, retryCount = 5) => {
  while (retryCount--) {
    try {
      return await createData(orderModel, payload);
    } catch (error: any) {
      if (!(error?.code === 11000 && error?.keyPattern?.orderId)) throw error;
    }
  }

  throw new Error("OrderId generation failed");
};

const normalizeOrderItems = (items: any[] = []) => {
  return items.map((item: any) => {
    const productValue = item?.productId;
    const productId = productValue?._id || productValue || null;

    return {
      ...item,
      productId,
      productName: String(item?.productName || productValue?.name || ""),
    };
  });
};

const normalizeOrderResponse = (order: any) => {
  if (!order) return order;

  return {
    ...order,
    items: normalizeOrderItems(order.items || []),
  };
};

export const createOrder = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createOrderSchema.validate(req.body || {});
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const authUser = req.headers.user as any;
    const email = String(value.email || value.contactEmail || "").toLowerCase();

    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidEmail, {}, {}));
    }

    value.email = email;
    if ("contactEmail" in value) delete value.contactEmail;

    let userId = value.userId || authUser?._id;
    if (userId) {
      userId = isValidObjectId(String(userId));
      if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("User"), {}, {}));
      }

      const existingUser = await getFirstMatch(userModel, { _id: userId, isDeleted: false }, {}, {});
      if (!existingUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("User"), {}, {}));
      }
    } else {
      let existingUser = await getFirstMatch(userModel, { email, isDeleted: false }, {}, {});

      if (!existingUser) {
        existingUser = await createData(userModel, {
          email,
          firstName: value.firstName,
          lastName: value.lastName,
          roles: USER_ROLES.USER,
          isActive: true,
          isDeleted: false,
        });
      }

      userId = existingUser?._id;
    }

    value.userId = userId;

    if (!value.addressId && !value.shippingAddress?.length) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, "Shipping address required", {}, {}));
    }

    if (value.addressId) {
      const addressId = isValidObjectId(String(value.addressId));
      if (!addressId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Address"), {}, {}));
      }

      const address = await getFirstMatch(addressModel, { _id: addressId, isDeleted: false }, {}, {});
      if (!address) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, "Address not found", {}, {}));
      }

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

    value.shippingAddress = normalizeShippingAddress(value.shippingAddress);

    const rawProductIds = Array.from(new Set<string>((value.items || []).map((item: any) => String(item.productId))));
    const validProductIds = rawProductIds.map((productId) => isValidObjectId(String(productId)));

    if (validProductIds.some((productId) => !productId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Product"), {}, {}));
    }

    const products = await getData(productModel, { _id: { $in: validProductIds }, isDeleted: false }, { name: 1 }, {});
    if (products.length !== validProductIds.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, "Product not found", {}, {}));
    }

    const productMap = new Map<string, any>(products.map((product: any) => [String(product._id), product]));
    value.items = (value.items || []).map((item: any) => ({
      ...item,
      productId: isValidObjectId(String(item.productId)) || item.productId,
      productName: String(productMap.get(String(item.productId))?.name || ""),
    }));

    value.subtotal = (value.items || []).reduce((sum: number, item: any) => sum + Number(item.price) * Number(item.quantity), 0);
    value.total = value.subtotal;

    if (!value.addressId) {
      const address = value.shippingAddress[0];
      const createdAddress = await createData(addressModel, {
        userId,
        country: address.country,
        address1: address.address1,
        address2: address.address2 || "",
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        isDefault: Boolean(address.default),
        isActive: true,
        isDeleted: false,
      });

      value.addressId = createdAddress?._id;
    }

    const order = await createOrderWithRetry(value);
    const normalizedOrder = normalizeOrderResponse(order?.toObject ? order.toObject() : order);

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, "Order created", normalizedOrder, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Server error", {}, error));
  }
};

export const getOrders = async (req, res) => {
  reqInfo(req);
  try {
    const { value, error } = getOrdersSchema.validate(req.query || {});
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.message, {}, {}));
    }

    const { page, limit, search } = value;
    const authUser = req.headers.user as any;
    const criteria: any = { isDeleted: false };

    if (authUser?.roles !== USER_ROLES.ADMIN) {
      criteria.$or = [{ userId: authUser?._id }, { email: authUser?.email }];
    }

    if (search) {
      criteria.$or = [{ orderId: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    }

    const { page: pageValue, limit: limitValue, skip } = resolvePagination(page, limit);

    const orders = await orderModel.find(criteria).populate("items.productId", "name").skip(skip).limit(limitValue || 0).lean();

    const total = await countData(orderModel, criteria);
    const normalizedOrders = (orders || []).map((order: any) => normalizeOrderResponse(order));

    return res.status(HTTP_STATUS.OK).json(
      new apiResponse(HTTP_STATUS.OK,"Orders",{  order_data: normalizedOrders,totalData: total, state: getPaginationState(total, pageValue, limitValue),},{})
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Server error", {}, error));
  }
};

export const getOrderById = async (req, res) => {
  reqInfo(req);
  try {
    const { value, error } = getOrderByIdSchema.validate(req.params || {});
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.message, {}, {}));
    }

    const order = await orderModel.findById(value.id).populate("items.productId", "name").lean();
    if (!order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, "Not found", {}, {}));
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, "Order", normalizeOrderResponse(order), {}));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Server error", {}, error));
  }
};

export const updateOrderShippingAddress = async (req, res) => {
  reqInfo(req);
  try {
    const { value, error } = updateOrderShippingAddressSchema.validate(req.body || {});
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.message, {}, {}));
    }

    const orderId = isValidObjectId(String(value.orderId));
    if (!orderId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Order"), {}, {}));
    }

    const updated = await updateData(orderModel, { _id: orderId }, { shippingAddress: normalizeShippingAddress(value.shippingAddress) }, {});

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, "Updated", normalizeOrderResponse(updated), {}));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Server error", {}, error));
  }
};

