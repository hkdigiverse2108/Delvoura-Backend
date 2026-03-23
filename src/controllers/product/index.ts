import { apiResponse, getPaginationState, HTTP_STATUS, isValidObjectId, parseDateRange, resolvePagination } from "../../common";
import { collectionModel, productModel, ratingModel, seasonModel } from "../../database";
import { aggregateData, countData, createData, findAllWithPopulateWithSorting, findOneAndPopulate, getData, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createProductSchema, deleteProductSchema, getProductByIdSchema, getProductsSchema, updateProductSchema } from "../../validation";

export const createProduct = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createProductSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const nameValue = value.name;
    value.name = nameValue;
    const exists = await getFirstMatch(productModel, { name: nameValue, isDeleted: false }, {}, {});
    if (exists) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));

    const rawCollectionIds = value.collectionIds ?? value.collectionId;
    let collectionIds = Array.isArray(rawCollectionIds) ? rawCollectionIds : (rawCollectionIds ? [rawCollectionIds] : []);
    collectionIds = Array.from(new Set(collectionIds.filter(Boolean)));
    if (collectionIds.length > 0) {
      const validCollectionIds = collectionIds.map((id) => isValidObjectId(id));
      if (validCollectionIds.some((id) => !id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Collection"), {}, {}));
      }
      const collections = await getData(collectionModel, { _id: { $in: validCollectionIds }, isDeleted: false }, { _id: 1 }, {});
      if (collections.length !== validCollectionIds.length) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Collection"), {}, {}));
      }
      value.collectionIds = validCollectionIds;
    }
    if ("collectionId" in value) delete value.collectionId;
    const rawSeasonIds = value.seasonIds ?? value.seasonId;
    let seasonIds = Array.isArray(rawSeasonIds) ? rawSeasonIds : (rawSeasonIds ? [rawSeasonIds] : []);
    seasonIds = Array.from(new Set(seasonIds.filter(Boolean)));
    if (seasonIds.length > 0) {
      const validSeasonIds = seasonIds.map((id) => isValidObjectId(id));
      if (validSeasonIds.some((id) => !id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Season"), {}, {}));
      }
      const seasons = await getData(seasonModel, { _id: { $in: validSeasonIds }, isDeleted: false }, { _id: 1 }, {});
      if (seasons.length !== validSeasonIds.length) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Season"), {}, {}));
      }
      value.seasonIds = validSeasonIds;
    }
    if ("seasonId" in value) delete value.seasonId;
    const rawScentIds = value.scentIds ?? value.scentId;
    let scentIds = Array.isArray(rawScentIds) ? rawScentIds : (rawScentIds ? [rawScentIds] : []);
    scentIds = Array.from(new Set(scentIds.filter(Boolean)));
    if (scentIds.length > 0) {
      const validScentIds = scentIds.map((id) => isValidObjectId(id));
      if (validScentIds.some((id) => !id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Scent"), {}, {}));
      }
      value.scentIds = validScentIds;
    }
    if ("scentId" in value) delete value.scentIds;

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

    const productId = isValidObjectId(value.productId);
    if (!productId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Product"), {}, {}));

    const existing = await getFirstMatch(productModel, { _id: productId, isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {}));

    const nameValue = value.name;
    const isExist = await getFirstMatch(productModel,{ name: nameValue, _id: { $ne: productId }, isDeleted: false },{},{} );
    if (isExist) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));
    value.name = nameValue;

   
    const rawCollectionIds = value.collectionIds ?? value.collectionId;
    let collectionIds = Array.isArray(rawCollectionIds) ? rawCollectionIds : (rawCollectionIds ? [rawCollectionIds] : []);
    collectionIds = Array.from(new Set(collectionIds.filter(Boolean)));
    if (collectionIds.length > 0) {
      const validCollectionIds = collectionIds.map((id) => isValidObjectId(id));
      if (validCollectionIds.some((id) => !id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Collection"), {}, {}));
      }
      const collections = await getData(collectionModel, { _id: { $in: validCollectionIds }, isDeleted: false }, { _id: 1 }, {});
      if (collections.length !== validCollectionIds.length) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Collection"), {}, {}));
      }
      value.collectionIds = validCollectionIds;
    }
    if ("collectionId" in value) delete value.collectionId;
    const rawSeasonIds = value.seasonIds ?? value.seasonId;
    let seasonIds = Array.isArray(rawSeasonIds) ? rawSeasonIds : (rawSeasonIds ? [rawSeasonIds] : []);
    seasonIds = Array.from(new Set(seasonIds.filter(Boolean)));
    if (seasonIds.length > 0) {
      const validSeasonIds = seasonIds.map((id) => isValidObjectId(id));
      if (validSeasonIds.some((id) => !id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Season"), {}, {}));
      }
      const seasons = await getData(seasonModel, { _id: { $in: validSeasonIds }, isDeleted: false }, { _id: 1 }, {});
      if (seasons.length !== validSeasonIds.length) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Season"), {}, {}));
      }
      value.seasonIds = validSeasonIds;
    }
    if ("seasonId" in value) delete value.seasonId;
    const rawScentIds = value.scentIds ?? value.scentId;
    let scentIds = Array.isArray(rawScentIds) ? rawScentIds : (rawScentIds ? [rawScentIds] : []);
    scentIds = Array.from(new Set(scentIds.filter(Boolean)));
    if (scentIds.length > 0) {
      const validScentIds = scentIds.map((id) => isValidObjectId(id));
      if (validScentIds.some((id) => !id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Scent"), {}, {}));
      }
      value.scentIds = validScentIds;
    }
    if ("scentId" in value) delete value.scentId;

    const updated = await updateData(productModel, { _id: productId }, value, {});
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

    const productId = isValidObjectId(value.id);
    if (!productId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Product"), {}, {}));

    const existing = await getFirstMatch(productModel, { _id: productId, isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {}));

    await updateData(productModel, { _id: productId }, { isDeleted: true }, {});
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

    const { page, limit, search, startDateFilter, endDateFilter, collectionFilter, seasonFilter, scentFilter, genderFilter, TrendingFilter, ActiveFilter, status } = value;
    let criteria: any = { isDeleted: false }, options: any = { lean: true };

    if (search) {
      criteria.$or = [
        { name: { $regex: search, $options: "si" } },
        { title: { $regex: search, $options: "si" } },
        { gender: { $regex: search, $options: "si" } },
        { variant: { $regex: search, $options: "si" } },
      ];
    }

    if (typeof ActiveFilter !== "undefined") {
      criteria.isActive = ActiveFilter;
    } else if (status === "active") {
      criteria.isActive = true;
    } else if (status === "inactive") {
      criteria.isActive = false;
    }
    let collectionIds: string[] = [];
    if (Array.isArray(collectionFilter)) collectionIds = collectionFilter;
    else if (collectionFilter) collectionIds = collectionFilter.split(",");
    collectionIds = collectionIds.filter(Boolean);
    if (collectionIds.length > 0) {
      const collectionObjectIds = collectionIds.map((id) => isValidObjectId(id)).filter(Boolean);
      if (!collectionObjectIds.length) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Collection"), {}, {}));
      criteria.collectionIds = { $in: collectionObjectIds };
    }

    let seasonIds: string[] = [];
    if (Array.isArray(seasonFilter)) seasonIds = seasonFilter;
    else if (seasonFilter) seasonIds = seasonFilter.split(",");
    seasonIds = seasonIds.filter(Boolean);
    if (seasonIds.length > 0) {
      const seasonObjectIds = seasonIds.map((id) => isValidObjectId(id)).filter(Boolean);
      if (!seasonObjectIds.length) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Season"), {}, {}));
      criteria.seasonIds = { $in: seasonObjectIds };
    }

    let scentIds: string[] = [];
    if (Array.isArray(scentFilter)) scentIds = scentFilter;
    else if (scentFilter) scentIds = scentFilter.split(",");
    scentIds = scentIds.filter(Boolean);
    if (scentIds.length > 0) {
      const scentObjectIds = scentIds.map((id) => isValidObjectId(id)).filter(Boolean);
      if (!scentObjectIds.length) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Scent"), {}, {}));
      criteria.scentIds = { $in: scentObjectIds };
    }
    const genderValue = genderFilter;
    if (genderValue) {
      criteria.gender = genderValue;
    }


    const trendingValue = TrendingFilter;
    if (typeof trendingValue !== "undefined") {
      criteria.isTrending = trendingValue;
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

    const response = await findAllWithPopulateWithSorting(productModel, criteria, {}, options, productPopulate);
    const totalCount = await countData(productModel, criteria);

    const productIds = response.map((product) => product?._id).filter(Boolean);
    const ratingSummaryMap = new Map<string, { avgRating: number; ratingCount: number }>();

    if (productIds.length > 0) {
      const ratingStats = await aggregateData(ratingModel, [
        { $match: { productId: { $in: productIds }, isDeleted: false } },
        { $group: { _id: "$productId", avgRating: { $avg: "$starRating" }, ratingCount: { $sum: 1 } } },
      ]);

      ratingStats.forEach((stat) => {
        ratingSummaryMap.set(String(stat._id), {
          avgRating: Number(stat.avgRating?.toFixed(2) || 0),
          ratingCount: stat.ratingCount || 0,
        });
      });
    }

    const enrichedResponse = response.map((product) => ({
      ...product,
      ratingSummary: ratingSummaryMap.get(String(product?._id)) || { avgRating: 0, ratingCount: 0 },
    }));

    const stateObj = getPaginationState(totalCount, pageValue, limitValue);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Products"), { product_data: enrichedResponse, totalData: totalCount, state: stateObj, }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getProductById = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getProductByIdSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const productId = isValidObjectId(value.id);
    if (!productId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Product"), {}, {}));

    const product = await findOneAndPopulate(productModel, { _id: productId, isDeleted: false }, {}, {}, productPopulate);
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {}));

    const ratingSummary = await getRatingSummary(product._id);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Product"), { ...product, ratingSummary }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

const getRatingSummary = async (productId) => {
  const ratingStats = await aggregateData(ratingModel, [
    { $match: { productId, isDeleted: false } },
    {$group: {_id: "$productId",avgRating: { $avg: "$starRating" }, ratingCount: { $sum: 1 },},},]);

  if (!ratingStats?.length) return { avgRating: 0, ratingCount: 0 };

  return {
    avgRating: Number(ratingStats[0].avgRating.toFixed(2)),
    ratingCount: ratingStats[0].ratingCount,
  };
};


const productPopulate = [
  { path: "collectionIds", select: "name" },
  { path: "seasonIds", select: "name" },
  { path: "scentIds", select: "name" }
];
