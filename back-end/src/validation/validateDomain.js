const Joi = require("joi");

exports.validateDomain = function (domain) {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

  const schema = Joi.object({
    name: Joi.string().pattern(domainRegex).required().messages({
      "string.pattern.base": `"name" must be a valid domain (e.g. example.com)`,
    }),
    description: Joi.string().min(10).optional().allow(""),
    status: Joi.number(),
    image: Joi.optional(),
    video: Joi.optional(),
    deleteImage: Joi.boolean().optional(),
    deleteVideo: Joi.boolean().optional(),
  });

  return schema.validate(domain, { abortEarly: false });
};
