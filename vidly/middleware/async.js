module.exports = function (handler) {
  return async (request, response, next) => {
    try {
      await handler(request, response);
    } catch (ex) {
      next(ex);
    }
  }
}
