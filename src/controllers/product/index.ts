import { apiResponse, HTTP_STATUS, isValidObjectId, parseDateRange } from "../../common";
import { categoryModel, collectionModel, ingredientModel, productModel, ratingModel } from "../../database";
import { aggregateData, countData, createData, findAllWithPopulateWithSorting, findOneAndPopulate, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createProductSchema, deleteProductSchema, getProductsSchema, updateProductSchema } from "../../validation";

const getRatingSummary = async (productId) => {
  const ratingStats = await aggregateData(ratingModel, [
    { $match: { productId, isDeleted: false } },
    {
      $group: {
        _id: "$productId",
        avgRating: { $avg: "$starRating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (!ratingStats?.length) return { avgRating: 0, ratingCount: 0 };

  return {
    avgRating: Number(ratingStats[0].avgRating.toFixed(2)),
    ratingCount: ratingStats[0].ratingCount,
  };
};

const productPopulate = [
  { path: "categoryId", select: "name" },
  { path: "collectionId", select: "name" },
  { path: "ingredientId", select: "name" },
];

export const createProduct = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createProductSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const nameValue = value.name.trim();
    value.name = nameValue;
    const exists = await getFirstMatch(productModel, { name: nameValue, isDeleted: false }, {}, {});
    if (exists) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));

    if (value.categoryId) {
      const category = await getFirstMatch(categoryModel, { _id: isValidObjectId(value.categoryId), isDeleted: false }, {}, {});
      if (!category) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Category"), {}, {}));
    }
    if (value.collectionId) {
      const collection = await getFirstMatch(collectionModel, { _id: isValidObjectId(value.collectionId), isDeleted: false }, {}, {});
      if (!collection) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Collection"), {}, {}));
    }
    if (value.ingredientId) {
      const ingredient = await getFirstMatch(ingredientModel, { _id: isValidObjectId(value.ingredientId), isDeleted: false }, {}, {});
      if (!ingredient) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Ingredient"), {}, {}));
    }

    const response = await createData(productModel, value);
    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Product"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateProduct = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateProductSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(productModel, { _id: isValidObjectId(value.productId), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {}));

    const nameValue = value.name.trim();
    const isExist = await getFirstMatch(
      productModel,
      { name: nameValue, _id: { $ne: isValidObjectId(value.productId) }, isDeleted: false },
      {},
      {}
    );
    if (isExist) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));
    value.name = nameValue;

    if (value.categoryId) {
      const category = await getFirstMatch(categoryModel, { _id: isValidObjectId(value.categoryId), isDeleted: false }, {}, {});
      if (!category) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Category"), {}, {}));
    }
    if (value.collectionId) {
      const collection = await getFirstMatch(collectionModel, { _id: isValidObjectId(value.collectionId), isDeleted: false }, {}, {});
      if (!collection) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Collection"), {}, {}));
    }
    if (value.ingredientId) {
      const ingredient = await getFirstMatch(ingredientModel, { _id: isValidObjectId(value.ingredientId), isDeleted: false }, {}, {});
      if (!ingredient) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Ingredient"), {}, {}));
    }

    const updated = await updateData(productModel, { _id: isValidObjectId(value.productId) }, value, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Product"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteProduct = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteProductSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(productModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {}));

    await updateData(productModel, { _id: isValidObjectId(value.id) }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Product"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getProducts = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getProductsSchema.validate(req.query);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter, categoryId, collectionId, ingredientId } = value;
    let criteria: any = { isDeleted: false }, options: any = { lean: true };

    if (search) {
      criteria.$or = [
        { name: { $regex: search, $options: "si" } },
        { title: { $regex: search, $options: "si" } },
        { brandName: { $regex: search, $options: "si" } },
        { manufacturerName: { $regex: search, $options: "si" } },
        { season: { $regex: search, $options: "si" } },
        { gender: { $regex: search, $options: "si" } },
        { variant: { $regex: search, $options: "si" } },
      ];
    }

    if (categoryId) {
      const categoryObjectId = isValidObjectId(categoryId);
      if (!categoryObjectId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Category"), {}, {}));
      criteria.categoryId = categoryObjectId;
    }
    if (collectionId) {
      const collectionObjectId = isValidObjectId(collectionId);
      if (!collectionObjectId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Collection"), {}, {}));
      criteria.collectionId = collectionObjectId;
    }
    if (ingredientId) {
      const ingredientObjectId = isValidObjectId(ingredientId);
      if (!ingredientObjectId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Ingredient"), {}, {}));
      criteria.ingredientId = ingredientObjectId;
    }

    const dateRange = parseDateRange(startDateFilter, endDateFilter);
    if (startDateFilter && endDateFilter && !dateRange) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Invalid date filter"), {}, {}));
    }
    if (dateRange) {
      criteria.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }

    if (page && limit) {
      options.page = parseInt(page);
      options.limit = parseInt(limit);
    }

    const response = await findAllWithPopulateWithSorting(productModel, criteria, {}, options, productPopulate);
    const totalCount = await countData(productModel, criteria);

    const stateObj = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || totalCount,
      page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
    };

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Products"), { product_data: response, totalData: totalCount, state: stateObj, }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getProductById = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteProductSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const product = await findOneAndPopulate(productModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {}, productPopulate);
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {}));

    const ratingSummary = await getRatingSummary(product._id);

    return res.status(HTTP_STATUS.OK).json(
      new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Product"), { ...product, ratingSummary }, {})
    );
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
