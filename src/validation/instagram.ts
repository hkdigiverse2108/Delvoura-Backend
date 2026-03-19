import Joi from "joi";

export const addEditInstagramSchema = Joi.object({
  instagramPosts: Joi.array()
    .items(
      Joi.object({
        imageUrl: Joi.string().required(),
        postUrl: Joi.string().required(),
        altText: Joi.string().allow(null, "").optional(),
      }).required()
    )
    .min(1)
    .optional(),
  isActive: Joi.boolean().optional(),
});
