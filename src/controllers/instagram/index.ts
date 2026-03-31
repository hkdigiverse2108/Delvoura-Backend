import { apiResponse, getPaginationState, HTTP_STATUS, INSTAGRAM_MEDIA_TYPES, isValidObjectId, parseDateRange, resolvePagination } from "../../common";
import { instagramModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { addEditInstagramSchema, createInstagramSchema, deleteInstagramSchema, getInstagramByIdSchema, getInstagramsSchema, updateInstagramSchema } from "../../validation";

export const createInstagram = async (req, res) => {
  reqInfo(req);
  try {
    const payload = inferInstagramType(req.body || {});
    const { error, value } = createInstagramSchema.validate(payload);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const response = await createData(instagramModel, value);
    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Instagram"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateInstagram = async (req, res) => {
  reqInfo(req);
  try {
    const payload = inferInstagramType(req.body || {});
    const { error, value } = updateInstagramSchema.validate(payload);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const instagramId = isValidObjectId(value.instagramId);
    if (!instagramId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Instagram"), {}, {}));

    const existing = await getFirstMatch(instagramModel, { _id: instagramId, isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Instagram"), {}, {}));

    const { instagramId: _ignore, ...updatePayload } = value;
    const updated = await updateData(instagramModel, { _id: instagramId }, updatePayload, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Instagram"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteInstagram = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteInstagramSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const instagramId = isValidObjectId(value.id);
    if (!instagramId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Instagram"), {}, {}));

    const existing = await getFirstMatch(instagramModel, { _id: instagramId, isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Instagram"), {}, {}));

    await updateData(instagramModel, { _id: instagramId }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Instagram"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getInstagrams = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getInstagramsSchema.validate(req.query || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter, ActiveFilter, status } = value;
    let criteria: any = { isDeleted: false }, options: any = { lean: true, sort: { createdAt: -1 } };

    if (search) {
      criteria.$or = [
        { link: { $regex: search, $options: "si" } },
        { imageUrl: { $regex: search, $options: "si" } },
        { videoUrl: { $regex: search, $options: "si" } },
      ];
    }

    if (typeof ActiveFilter !== "undefined") {
      criteria.isActive = ActiveFilter;
    } else if (status === "active") {
      criteria.isActive = true;
    } else if (status === "inactive") {
      criteria.isActive = false;
    }

    const dateRange = parseDateRange(startDateFilter, endDateFilter);
    if (startDateFilter && endDateFilter && !dateRange) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Invalid date filter"), {}, {}));
    
    if (dateRange) {
      criteria.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }

    const { page: pageValue, limit: limitValue, skip, hasLimit } = resolvePagination(page, limit);
    if (hasLimit) {
      options.skip = skip;
      options.limit = limitValue;
    }

    const response = await getDataWithSorting(instagramModel, criteria, {}, options);
    const totalCount = await countData(instagramModel, criteria);
    const stateObj = getPaginationState(totalCount, pageValue, limitValue);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Instagrams"), { instagram_data: response, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getInstagramById = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getInstagramByIdSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const instagramId = isValidObjectId(value.id);
    if (!instagramId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Instagram"), {}, {}));

    const response = await getFirstMatch(instagramModel, { _id: instagramId, isDeleted: false }, {}, {});
    if (!response) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Instagram"), {}, {}));

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Instagram"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

const inferInstagramType = (payload: any) => {
  if (!payload) return payload;

  if (typeof payload.type === "string" && payload.type.trim() !== "") {
    return payload;
  }

  const imageUrl = payload.imageUrl;
  const videoUrl = payload.videoUrl;
  const hasImage = typeof imageUrl === "string" && imageUrl.trim() !== "";
  const hasVideo = typeof videoUrl === "string" && videoUrl.trim() !== "";

  if (hasImage && !hasVideo) {
    return { ...payload, type: INSTAGRAM_MEDIA_TYPES.IMG };
  }
  if (hasVideo && !hasImage) {
    return { ...payload, type: INSTAGRAM_MEDIA_TYPES.VIDEO };
  }

  return payload;
};
