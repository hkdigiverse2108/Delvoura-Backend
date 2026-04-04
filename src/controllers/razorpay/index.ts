import axios from "axios";
import { apiResponse, HTTP_STATUS, isValidObjectId } from "../../common";
import { orderModel, settingsModel } from "../../database";
import { getFirstMatch, getRazorpayAuthHeader, getRazorpayClientConfig, getRazorpayUrl, normalizeRazorpayAmount, reqInfo, resolveRazorpayAmountUnit, responseMessage, updateData, verifyRazorpaySignature } from "../../helper";
import type { RazorpayClientConfigOverrides } from "../../helper";
import { createRazorpayPaymentSchema, razorpayOrderStatusByOrderIdSchema, razorpayOrderStatusSchema, razorpayPaymentVerifySchema, razorpayRefundSchema, razorpayRefundStatusSchema } from "../../validation";

const buildOrderLookupCriteria = (rawOrderId: string) => {
  const normalizedOrderId = String(rawOrderId || "").trim();
  const objectId = isValidObjectId(normalizedOrderId);

  if (objectId) {
    return {
      isDeleted: false,
      $or: [{ _id: objectId }, { orderId: normalizedOrderId.toUpperCase() }],
    };
  }

  return { orderId: normalizedOrderId.toUpperCase(), isDeleted: false };
};

export const create_razorpay_payment = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createRazorpayPaymentSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { amount, amountUnit, currency, receipt, notes, orderId } = value;
    const paymentCapture = value.payment_capture ?? value.paymentCapture;

    let resolvedOrderId: string | null = null;
    let orderData: any = null;
    if (orderId) {
      orderData = await getFirstMatch(orderModel, buildOrderLookupCriteria(orderId), {}, {});
      if (!orderData) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Order"), {}, {}));
      }
      resolvedOrderId = String(orderData?._id);
    }

    let effectiveAmount = amount;
    if ((!Number.isFinite(effectiveAmount) || effectiveAmount === undefined) && orderData) {
      effectiveAmount = Number(orderData.total);
    }
    if (!Number.isFinite(effectiveAmount)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Amount is required"), {}, {}));
    }

    let normalizedAmount: number;
    try {
      const resolvedUnit = resolveRazorpayAmountUnit(amountUnit);
      normalizedAmount = normalizeRazorpayAmount(effectiveAmount, resolvedUnit);
    } catch (amountError: any) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage(amountError?.message || "Invalid amount"), {}, {}));
    }

    const payload: any = {
      amount: normalizedAmount,
      currency: currency || orderData?.currency || "INR",
    };

    if (receipt || orderData?._id || orderData?.orderId) {
      payload.receipt = receipt || `order_${orderData?.orderId || orderData?._id}`;
    }

    if (notes) payload.notes = notes;
    if (paymentCapture !== undefined) payload.payment_capture = paymentCapture;

    const razorpayConfig = await getRazorpaySettingsConfig();
    const { keyId } = getRazorpayClientConfig(razorpayConfig);
    const response = await axios.post(getRazorpayUrl("/orders"), payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: getRazorpayAuthHeader(razorpayConfig),
      },
    });

    const razorpayOrderId = response.data?.id || response.data?.order_id;
    if (resolvedOrderId && razorpayOrderId) {
      await updateData(orderModel, { _id: resolvedOrderId }, { razorpayId: razorpayOrderId }, {});
    }

    return res
      .status(HTTP_STATUS.OK)
      .json(new apiResponse(HTTP_STATUS.OK, responseMessage.customMessage("Payment initiated"), { razorpayOrderId, orderId: orderData?.orderId || null, razorpayKeyId: keyId, razorpay: response.data }, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const razorpay_verify_payment = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = razorpayPaymentVerifySchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const razorpayOrderId = value.razorpay_order_id || value.razorpayOrderId;
    const razorpayPaymentId = value.razorpay_payment_id || value.razorpayPaymentId;
    const razorpaySignature = value.razorpay_signature || value.razorpaySignature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Payment verification data missing"), {}, {}));
    }

    const razorpayConfig = await getRazorpaySettingsConfig();
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, razorpayConfig);
    if (!isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Invalid Razorpay signature"), { verified: false }, {}));
    }

    let criteria: any = { razorpayId: razorpayOrderId, isDeleted: false };
    if (value.orderId) {
      const order = await getFirstMatch(orderModel, buildOrderLookupCriteria(value.orderId), {}, {});
      if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Order"), {}, {}));
      criteria = { _id: order._id, isDeleted: false };
    }

    const updatePayload: any = { paymentStatus: "paid" };
    if (value.orderId) {
      updatePayload.razorpayId = razorpayOrderId;
    }

    const updated = await updateData(orderModel, criteria, updatePayload, {});
    if (!updated) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Order"), {}, {}));

    return res
      .status(HTTP_STATUS.OK)
      .json(new apiResponse(HTTP_STATUS.OK, responseMessage.customMessage("Payment verified"), { verified: true, order: updated }, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const razorpay_order_status = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = razorpayOrderStatusSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const razorpayConfig = await getRazorpaySettingsConfig();
    const response = await axios.get(getRazorpayUrl(`/orders/${value.razorpayOrderId}`), {
      headers: {
        "Content-Type": "application/json",
        Authorization: getRazorpayAuthHeader(razorpayConfig),
      },
    });

    const statusValue = response.data?.status || response.data?.data?.status;
    if (statusValue) {
      await updateData(orderModel, { razorpayId: value.razorpayOrderId, isDeleted: false }, { paymentStatus: String(statusValue) }, {});
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("order status"), response.data, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const razorpay_order_status_by_order = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = razorpayOrderStatusByOrderIdSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const order = await getFirstMatch(orderModel, buildOrderLookupCriteria(value.orderId), {}, {});
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Order"), {}, {}));

    if (!order?.razorpayId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Razorpay order id missing"), {}, {}));
    }

    const razorpayConfig = await getRazorpaySettingsConfig();
    const response = await axios.get(getRazorpayUrl(`/orders/${order.razorpayId}`), {
      headers: {
        "Content-Type": "application/json",
        Authorization: getRazorpayAuthHeader(razorpayConfig),
      },
    });

    const statusValue = response.data?.status || response.data?.data?.status;
    if (statusValue) {
      await updateData(orderModel, { _id: order._id, isDeleted: false }, { paymentStatus: String(statusValue) }, {});
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("order status"), response.data, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const razorpay_refund = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = razorpayRefundSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { paymentId, amount, amountUnit, speed, receipt, notes } = value;

    const payload: any = {};
    if (amount !== undefined) {
      let normalizedAmount: number;
      try {
        const resolvedUnit = resolveRazorpayAmountUnit(amountUnit);
        normalizedAmount = normalizeRazorpayAmount(amount, resolvedUnit);
      } catch (amountError: any) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage(amountError?.message || "Invalid amount"), {}, {}));
      }
      payload.amount = normalizedAmount;
    }

    if (speed) payload.speed = speed;
    if (receipt) payload.receipt = receipt;
    if (notes) payload.notes = notes;

    const razorpayConfig = await getRazorpaySettingsConfig();
    const response = await axios.post(getRazorpayUrl(`/payments/${paymentId}/refund`), payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: getRazorpayAuthHeader(razorpayConfig),
      },
    });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.customMessage("Refund initiated"), response.data, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const razorpay_refund_status = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = razorpayRefundStatusSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const razorpayConfig = await getRazorpaySettingsConfig();
    const response = await axios.get(getRazorpayUrl(`/refunds/${value.refundId}`), {
      headers: {
        "Content-Type": "application/json",
        Authorization: getRazorpayAuthHeader(razorpayConfig),
      },
    });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("refund status"), response.data, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const razorpay_callback = async (req, res) => {
  reqInfo(req);
  try {
    const body = req.body || {};

    const paymentEntity = body?.payload?.payment?.entity;
    const orderEntity = body?.payload?.order?.entity;

    const razorpayOrderId =
      paymentEntity?.order_id ||
      orderEntity?.id ||
      body?.payload?.payment?.entity?.orderId ||
      body?.payload?.order?.entity?.orderId;

    const statusValue =
      paymentEntity?.status ||
      orderEntity?.status ||
      body?.payload?.payment?.entity?.status ||
      body?.payload?.order?.entity?.status ||
      body?.event;

    if (razorpayOrderId && statusValue) {
      await updateData(orderModel, { razorpayId: String(razorpayOrderId), isDeleted: false }, { paymentStatus: String(statusValue) }, {});
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.customMessage("Callback received"), { body }, {}));
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

const getRazorpaySettingsConfig = async (): Promise<RazorpayClientConfigOverrides> => {
  const settings = await settingsModel.findOne({ isDeleted: false }).lean();
  if (!settings) return {};

  return {
    keyId: settings.razorpayApiKey ?? undefined,
    keySecret: settings.razorpayApiSecret ?? undefined,
  };
};
