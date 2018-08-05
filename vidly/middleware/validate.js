module.exports = (validator) => {
  return (request, response, next) => {
    const { error } = validator(request.body);
    if (error) return response.status(400).send(error.details[0].message);
    next();
  };
};
