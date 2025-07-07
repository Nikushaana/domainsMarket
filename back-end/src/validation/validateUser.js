const Joi = require("joi");

exports.validateUser = function (user) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(user, { abortEarly: false });
};
