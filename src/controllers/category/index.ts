import { Request, Response } from "express";
import { apiResponse, HTTP_STATUS, isValidObjectId } from "../../common";
import { categoryModel } from "../../database";
import { createData, getData, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createCategorySchema, updateCategorySchema } from "../../validation";

const normalizeParamId = (raw: string | string[] | undefined) => {
  if (Array.isArray(raw)) return raw[0];
  return raw;
};

export const createCategory = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const nameValue = value.name.trim();

    const exists = await getFirstMatch(categoryModel,{ name: nameValue, isDeleted: false },{},{});

    if (exists) {
      return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Category"), {}, {}));
    }

    const created = await createData(categoryModel, {name: nameValue,sActive: typeof value.isActive === "boolean" ? value.isActive : true,isDeleted: false,});

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Category"), created, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await getData(categoryModel, { isDeleted: false }, {}, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Categories"), categories, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const id = normalizeParamId(req.params.id);
    if (!id || !isValidObjectId(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Category"), {}, {}));
    }

    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const existing = await getFirstMatch(categoryModel, { _id: id, isDeleted: false }, {}, {});
    if (!existing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Category"), {}, {}));
    }

    const updatePayload: any = {};

    if (value.name) {
      const nameValue = value.name.trim();
      const nameExists = await getFirstMatch(categoryModel,{ name: nameValue, _id: { $ne: id }, isDeleted: false },{},{});
      if (nameExists) {
        return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Category"), {}, {}));
      }
      updatePayload.name = nameValue;
    }

    if (typeof value.isActive === "boolean") updatePayload.isActive = value.isActive;

    if (Object.keys(updatePayload).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.addDataError, {}, {}));
    }

    const updated = await updateData(categoryModel, { _id: id }, updatePayload, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Category"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const id = normalizeParamId(req.params.id);
    if (!id || !isValidObjectId(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Category"), {}, {}));
    }

    const existing = await getFirstMatch(categoryModel, { _id: id, isDeleted: false }, {}, {});
    if (!existing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Category"), {}, {}));
    }

    await updateData(categoryModel, { _id: id }, { isDeleted: true, isActive: false }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Category"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
