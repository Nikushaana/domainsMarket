const Joi = require("joi");

exports.validateAdminUpdate = function (admin) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(6).optional().allow(""),
  });

  return schema.validate(admin, { abortEarly: false });
};
