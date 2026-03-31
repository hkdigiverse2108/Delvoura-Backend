import Joi from "joi";
import { INSTAGRAM_MEDIA_TYPES } from "../common/enum";

const mediaTypeSchema = Joi.string().valid(INSTAGRAM_MEDIA_TYPES.IMG, INSTAGRAM_MEDIA_TYPES.VIDEO).required();
const imageUrlSchema = Joi.string().trim().allow(null, "").optional();
const videoUrlSchema = Joi.string().trim().allow(null, "").optional();

const enforceSingleMediaByType = (value, helpers) => {
  const imageUrl = value.imageUrl;
  const videoUrl = value.videoUrl;
  const hasImage = typeof imageUrl === "string" && imageUrl.trim() !== "";
  const hasVideo = typeof videoUrl === "string" && videoUrl.trim() !== "";

  if (value.type === INSTAGRAM_MEDIA_TYPES.IMG && hasVideo) {
    return helpers.message("videoUrl must be empty when type is img.");
  }
  if (value.type === INSTAGRAM_MEDIA_TYPES.VIDEO && hasImage) {
    return helpers.message("imageUrl must be empty when type is video.");
  }

  return value;
};

const imageUrlWhenImg = imageUrlSchema.when("type", {
  is: INSTAGRAM_MEDIA_TYPES.IMG,
  then: Joi.string().trim().required(),
  otherwise: imageUrlSchema,
});

const videoUrlWhenVideo = videoUrlSchema.when("type", {
  is: INSTAGRAM_MEDIA_TYPES.VIDEO,
  then: Joi.string().trim().required(),
  otherwise: videoUrlSchema,
});

export const createInstagramSchema = Joi.object({
  type: mediaTypeSchema,
  imageUrl: imageUrlWhenImg,
  link: Joi.string().required(),
  videoUrl: videoUrlWhenVideo,
  isActive: Joi.boolean().optional(),
}).custom(enforceSingleMediaByType);

export const updateInstagramSchema = Joi.object({
  instagramId: Joi.string().required(),
  type: mediaTypeSchema,
  imageUrl: imageUrlWhenImg,
  link: Joi.string().required(),
  videoUrl: videoUrlWhenVideo,
  isActive: Joi.boolean().optional(),
}).custom(enforceSingleMediaByType);

export const deleteInstagramSchema = Joi.object({
  id: Joi.string().required(),
});

export const getInstagramByIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const getInstagramsSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional(),
  ActiveFilter: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").lowercase().optional(),
  startDateFilter: Joi.string().optional(),
  endDateFilter: Joi.string().optional(),
});

export const addEditInstagramSchema = Joi.object({
  instagramId: Joi.string().optional(),
  type: mediaTypeSchema,
  imageUrl: imageUrlWhenImg,
  link: Joi.string().required(),
  videoUrl: videoUrlWhenVideo,
  isActive: Joi.boolean().optional(),
}).custom(enforceSingleMediaByType);
