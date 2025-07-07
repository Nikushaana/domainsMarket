const Joi = require("joi");

exports.validateDomain = function (domain) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(10).optional().allow(""),
    status: Joi.number(),
    deleteImage: Joi.boolean().optional(),
    deleteVideo: Joi.boolean().optional(),
  });

  return schema.validate(domain, { abortEarly: false });
};
