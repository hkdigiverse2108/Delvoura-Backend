import { apiResponse, HTTP_STATUS } from "../../common";
import { refundPolicyModel } from "../../database";
import { reqInfo, responseMessage, updateData } from "../../helper";
import { addEditRefundPolicySchema } from "../../validation";

export const add_edit_refund_policy = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = addEditRefundPolicySchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const response = await updateData(refundPolicyModel, { isDeleted: false }, value, { upsert: true });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("refund policy"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const get_refund_policy = async (req, res) => {
  reqInfo(req);
  try {
    const response = await refundPolicyModel.findOne({ isDeleted: false }).lean();

    if (!response) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("refund policy"), {}, {}));

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("refund policy"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
