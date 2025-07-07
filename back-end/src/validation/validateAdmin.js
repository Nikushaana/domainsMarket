const Joi = require("joi");

exports.validateAdmin = function (admin) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(admin, { abortEarly: false });
};
