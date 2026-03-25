import Joi from "joi";

export const addEditBannerSchema = Joi.object({
  bannerImages: Joi.array().items(Joi.string().required()).min(1).optional(),
});
