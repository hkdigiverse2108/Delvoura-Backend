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
    const envSettings = getPhonePeEnvSettings();
    const mergedResponse = { ...(envSettings || {}), ...(response || {}) };

    if (!response && Object.keys(envSettings).length === 0) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("settings"), {}, {}));
    
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("settings"), mergedResponse, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

const getPhonePeEnvSettings = () => {
  const envSettings: any = {};
  const enabled = process.env.PHONEPE_ENABLED;
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION;

  if (typeof enabled !== "undefined") envSettings.isPhonePe = enabled === "true";
  if (clientId) envSettings.phonePeApiKey = clientId;
  if (clientSecret) envSettings.phonePeApiSecret = clientSecret;
  if (clientVersion) {
    const parsed = Number(clientVersion);
    envSettings.phonePeVersion = Number.isNaN(parsed) ? clientVersion : parsed;
  }

  return envSettings;
};