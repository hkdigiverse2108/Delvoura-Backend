import axios from "axios";
import { randomUUID } from "crypto";
import { apiResponse, HTTP_STATUS, isValidObjectId } from "../../common";
import { orderModel } from "../../database";
import { getPhonePeAccessToken, getPhonePeRedirectUrls, getPhonePeUrl, getFirstMatch, normalizePhonePeAmount, reqInfo, resolvePhonePeAmountUnit, responseMessage, updateData } from "../../helper";
import { createPhonePePaymentSchema, phonePeOrderStatusSchema, phonePeRefundSchema, phonePeRefundStatusSchema } from "../../validation";

export const create_phonepe_payment = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createPhonePePaymentSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));


    const { amount, amountUnit, expireAfter, message, metaInfo, redirectUrl, callbackUrl, orderId } = value;
    const merchantOrderId = value.merchantOrderId || generateMerchantOrderId();

    let resolvedOrderId: string | false = false;
    let orderData: any = null;
    if (orderId) {
      resolvedOrderId = isValidObjectId(orderId);
      if (!resolvedOrderId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Order"), {}, {}));
      }
      orderData = await getFirstMatch(orderModel, { _id: resolvedOrderId, isDeleted: false }, {}, {});
      if (!orderData) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Order"), {}, {}));
      }
    }

    const { redirectUrl: fallbackRedirectUrl, callbackUrl: fallbackCallbackUrl } = getPhonePeRedirectUrls();
    const finalRedirectUrl = redirectUrl || fallbackRedirectUrl;
    const finalCallbackUrl = callbackUrl || fallbackCallbackUrl;

    if (!finalRedirectUrl) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Redirect URL is required"), {}, {}));

    let effectiveAmount = amount;
    if ((!Number.isFinite(effectiveAmount) || effectiveAmount === undefined) && orderData) {
      effectiveAmount = Number(orderData.total);
    }
    if (!Number.isFinite(effectiveAmount)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Amount is required"), {}, {}));
    }

    let normalizedAmount: number;
    try {
      const resolvedUnit = resolvePhonePeAmountUnit(amountUnit);
      normalizedAmount = normalizePhonePeAmount(effectiveAmount, resolvedUnit);
    } catch (amountError: any) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage(amountError?.message || "Invalid amount"), {}, {}));
    }

    const payload: any = {
      merchantOrderId,
      amount: normalizedAmount,
      expireAfter: expireAfter ?? 1200,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: message || "Payment",
        merchantUrls: {
          redirectUrl: finalRedirectUrl,
        },
      },
    };

    if (finalCallbackUrl) {
      payload.paymentFlow.merchantUrls.callbackUrl = finalCallbackUrl;
    }

    if (metaInfo) {
      payload.metaInfo = metaInfo;
    }

    const token = await getPhonePeAccessToken();
    const response = await axios.post(getPhonePeUrl("/checkout/v2/pay"), payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    });

    if (resolvedOrderId) {
      await updateData(orderModel, { _id: resolvedOrderId }, { phonePeId: merchantOrderId }, {});
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.customMessage("Payment initiated"), { merchantOrderId, phonepe: response.data }, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const phonepe_order_status = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = phonePeOrderStatusSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));


    const token = await getPhonePeAccessToken();
    const response = await axios.get(getPhonePeUrl(`/checkout/v2/order/${value.merchantOrderId}/status`), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    });

    const statusValue =
      response.data?.state ||
      response.data?.status ||
      response.data?.data?.state ||
      response.data?.data?.status;

    if (statusValue) {
      await updateData(orderModel, { phonePeId: value.merchantOrderId, isDeleted: false }, { paymentStatus: String(statusValue) }, {});
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("order status"), response.data, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const phonepe_refund = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = phonePeRefundSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { amount, amountUnit, ...refundPayload } = value;
    let normalizedAmount: number;
    try {
      const resolvedUnit = resolvePhonePeAmountUnit(amountUnit);
      normalizedAmount = normalizePhonePeAmount(amount, resolvedUnit);
    } catch (amountError: any) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage(amountError?.message || "Invalid amount"), {}, {}));
    }

    const token = await getPhonePeAccessToken();
    const response = await axios.post(getPhonePeUrl("/payments/v2/refund"), { ...refundPayload, amount: normalizedAmount }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.customMessage("Refund initiated"), response.data, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const phonepe_refund_status = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = phonePeRefundStatusSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const token = await getPhonePeAccessToken();
    const response = await axios.get(getPhonePeUrl(`/payments/v2/refund/${value.merchantRefundId}/status`), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("refund status"), response.data, {}));
  } catch (error: any) {
    const errorPayload = error?.response?.data || error;
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, errorPayload));
  }
};

export const phonepe_callback = async (req, res) => {
  reqInfo(req);
  try {
    const body = req.body || {};
    const query = req.query || {};

    const merchantOrderId =
      body?.merchantOrderId ||
      body?.data?.merchantOrderId ||
      body?.orderId ||
      body?.data?.orderId ||
      query?.merchantOrderId ||
      query?.orderId;

    const statusValue =
      body?.state ||
      body?.status ||
      body?.data?.state ||
      body?.data?.status ||
      query?.state ||
      query?.status;

    if (merchantOrderId && statusValue) {
      await updateData(orderModel, { phonePeId: String(merchantOrderId), isDeleted: false }, { paymentStatus: String(statusValue) }, {});
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.customMessage("Callback received"), { body, query }, {}));
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const phonepe_redirect = async (req, res) => {
  reqInfo(req);
  return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.customMessage("Redirect received"), { query: req.query }, {}));
};

const generateMerchantOrderId = () => {
  return randomUUID();
};