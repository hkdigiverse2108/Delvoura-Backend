import { apiResponse, HTTP_STATUS } from "../../common";
import { settingsModel } from "../../database";
import { reqInfo, responseMessage, updateData } from "../../helper";
import { addEditSettingsSchema } from "../../validation";

export const add_edit_settings = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = addEditSettingsSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const response = await updateData(settingsModel, { isDeleted: false }, value, { upsert: true });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("settings"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const get_settings = async (req, res) => {
  reqInfo(req);
  try {
    const response = await settingsModel.findOne({ isDeleted: false }).lean();

    if (!response) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("settings"), {}, {}));

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("settings"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
