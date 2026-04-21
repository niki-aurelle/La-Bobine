const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => d.message);
    throw ApiError.badRequest('Données invalides.', details);
  }
  req[source] = value;
  next();
};

module.exports = validate;
