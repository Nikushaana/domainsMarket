const Joi = require("joi");

exports.validateUserUpdate = function (user) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(6).optional().allow(""),
    images: Joi.optional(),
    videos: Joi.optional(),
    deletedImages: Joi.alternatives()
      .try(Joi.string().allow(""), Joi.array().items(Joi.string()))
      .optional(),
    deletedVideos: Joi.alternatives()
      .try(Joi.string().allow(""), Joi.array().items(Joi.string()))
      .optional(),
  });

  return schema.validate(user, { abortEarly: false });
};
