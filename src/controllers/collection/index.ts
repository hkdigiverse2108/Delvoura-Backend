import { Request, Response } from "express";
import { apiResponse, HTTP_STATUS, isValidObjectId } from "../../common";
import { collectionModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createCollectionSchema, updateCollectionSchema } from "../../validation";

const normalizeParamId = (raw: string | string[] | undefined) => {
  if (Array.isArray(raw)) return raw[0];
  return raw;
};

const applyDateFilter = (criteria: any, startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return;

  const createdAt: any = {};
  if (typeof startDate === "string") {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime())) createdAt.$gte = start;
  }
  if (typeof endDate === "string") {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) createdAt.$lte = end;
  }

  if (Object.keys(createdAt).length > 0) criteria.createdAt = createdAt;
};

const parsePositiveInt = (value: any) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const createCollection = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { error, value } = createCollectionSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const nameValue = value.name.trim();

    const exists = await getFirstMatch(collectionModel, { name: nameValue, isDeleted: false }, {}, {});
    if (exists) {
      return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Collection"), {}, {}));
    }

    const created = await createData(collectionModel, {
      name: nameValue,
      isActive: typeof value.isActive === "boolean" ? value.isActive : true,
      isDeleted: false,
    });

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Collection"), created, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getCollections = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { page, limit, search, startDate, endDate, activeFilter } = req.query;

    const criteria: any = { isDeleted: false };

    const searchValue = typeof search === "string" ? search : "";
    if (searchValue) {
      criteria.$or = [{ name: { $regex: searchValue, $options: "si" } }];
    }

    if (activeFilter !== undefined) criteria.isActive = activeFilter == "true";

    applyDateFilter(criteria, startDate as string, endDate as string);

    const options: any = { sort: { createdAt: -1 } };
    const pageValue = parsePositiveInt(page);
    const limitValue = parsePositiveInt(limit);

    if (pageValue && limitValue) {
      options.skip = (pageValue - 1) * limitValue;
      options.limit = limitValue;
    }

    const collections = await getDataWithSorting(collectionModel, criteria, {}, options);
    const totalData = await countData(collectionModel, criteria);
    const totalPages = limitValue ? Math.ceil(totalData / limitValue) || 1 : 1;

    const stateObj = {
      page,
      limit,
      totalPages,
    };

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Collections"), { collection_data: collections, totalData, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateCollection = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const id = normalizeParamId(req.params.id);
    if (!id || !isValidObjectId(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Collection"), {}, {}));
    }

    const { error, value } = updateCollectionSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const existing = await getFirstMatch(collectionModel, { _id: id, isDeleted: false }, {}, {});
    if (!existing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Collection"), {}, {}));
    }

    const updatePayload: any = {};

    if (value.name) {
      const nameValue = value.name.trim();
      const nameExists = await getFirstMatch(collectionModel, { name: nameValue, _id: { $ne: id }, isDeleted: false }, {}, {});
      if (nameExists) {
        return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Collection"), {}, {}));
      }
      updatePayload.name = nameValue;
    }

    if (typeof value.isActive === "boolean") updatePayload.isActive = value.isActive;

    if (Object.keys(updatePayload).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.addDataError, {}, {}));
    }

    const updated = await updateData(collectionModel, { _id: id }, updatePayload, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Collection"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const id = normalizeParamId(req.params.id);
    if (!id || !isValidObjectId(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Collection"), {}, {}));
    }

    const existing = await getFirstMatch(collectionModel, { _id: id, isDeleted: false }, {}, {});
    if (!existing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Collection"), {}, {}));
    }

    await updateData(collectionModel, { _id: id }, { isDeleted: true, isActive: false }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Collection"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
