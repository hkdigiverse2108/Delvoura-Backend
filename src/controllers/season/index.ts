import { apiResponse, getPaginationState, HTTP_STATUS, isValidObjectId, parseDateRange, resolvePagination } from "../../common";
import { seasonModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createSeasonSchema, deleteSeasonSchema, getSeasonsSchema, updateSeasonSchema } from "../../validation";

export const createSeason = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createSeasonSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const nameValue = value.name;
    value.name = nameValue;
    const exists = await getFirstMatch(seasonModel, { name: nameValue, isDeleted: false }, {}, {});
    if (exists) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));

    const response = await createData(seasonModel, value);

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Season"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateSeason = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateSeasonSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(seasonModel, { _id: isValidObjectId(value.seasonId), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Season"), {}, {}));

    const nameValue = value.name;
    let isExist = await getFirstMatch(seasonModel, { name: nameValue, _id: { $ne: isValidObjectId(value.seasonId) }, isDeleted: false }, {}, {});
    if (isExist) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));
    value.name = nameValue;

    const updated = await updateData(seasonModel, { _id: isValidObjectId(value.seasonId) }, value, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Season"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteSeason = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteSeasonSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(seasonModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Season"), {}, {}));

    await updateData(seasonModel, { _id: isValidObjectId(value.id) }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Season"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getSeasons = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getSeasonsSchema.validate(req.query);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter, ActiveFilter, status } = value;
    let criteria: any = { isDeleted: false }, options: any = { lean: true };

    if (search) {
      criteria.$or = [{ name: { $regex: search, $options: "si" } }];
    }

    if (typeof ActiveFilter !== "undefined") {
      criteria.isActive = ActiveFilter;
    } else if (status === "active") {
      criteria.isActive = true;
    } else if (status === "inactive") {
      criteria.isActive = false;
    }

    const dateRange = parseDateRange(startDateFilter, endDateFilter);
    if (startDateFilter && endDateFilter && !dateRange) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Invalid date filter"), {}, {}));
    }
    if (dateRange) {
      criteria.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }

    const { page: pageValue, limit: limitValue, skip, hasLimit } = resolvePagination(page, limit);
    if (hasLimit) {
      options.skip = skip;
      options.limit = limitValue;
    }

    const response = await getDataWithSorting(seasonModel, criteria, {}, options);
    const totalCount = await countData(seasonModel, criteria);

    const stateObj = getPaginationState(totalCount, pageValue, limitValue);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Seasons"), { season_data: response, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
