import Joi from "joi";

export const deleteImageSchema = Joi.object().keys({
  fileUrl: Joi.string().required(),
});

export const uploadImageSchema = Joi.object().keys({
  file: Joi.any().required(),
});
