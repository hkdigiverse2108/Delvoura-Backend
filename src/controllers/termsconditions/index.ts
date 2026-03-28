import { apiResponse, HTTP_STATUS } from "../../common";
import { termsConditionsModel } from "../../database";
import { reqInfo, responseMessage, updateData } from "../../helper";
import { addEditTermsConditionsSchema } from "../../validation";

export const add_edit_terms_conditions = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = addEditTermsConditionsSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const response = await updateData(termsConditionsModel, { isDeleted: false }, value, { upsert: true });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("terms conditions"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const get_terms_conditions = async (req, res) => {
  reqInfo(req);
  try {
    const response = await termsConditionsModel.findOne({ isDeleted: false }).lean();

    if (!response) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("terms conditions"), {}, {}));

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("terms conditions"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
