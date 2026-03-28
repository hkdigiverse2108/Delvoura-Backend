import { apiResponse, HTTP_STATUS } from "../../common";
import { returnExchangeModel } from "../../database";
import { reqInfo, responseMessage, updateData } from "../../helper";
import { addEditReturnExchangeSchema } from "../../validation";

export const add_edit_return_exchange = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = addEditReturnExchangeSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const response = await updateData(returnExchangeModel, { isDeleted: false }, value, { upsert: true });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("return exchange"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const get_return_exchange = async (req, res) => {
  reqInfo(req);
  try {
    const response = await returnExchangeModel.findOne({ isDeleted: false }).lean();

    if (!response) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("return exchange"), {}, {}));

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("return exchange"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
