const Joi = require('joi');

exports.schemaChangePassword = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().allow(''),
  newPassword: Joi.string(),
});

exports.schemaLogin = Joi.object({
  companyId: Joi.string().required(),
  email: Joi.string().email(),
  password: Joi.string().when('email', {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  token: Joi.string(),
})
  .xor('email', 'token')
  .messages({
    'object.missing': 'Either (companyId, email, password) or (companyId, token) is required.',
  });
exports.schemaRegister = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().when('email', {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  password: Joi.string().when('email', {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  token: Joi.string(),
})
  .xor('email', 'token')
  .messages({
    'object.missing': 'Either (companyId, email, name, password) or (companyId, token) is required.',
  });

