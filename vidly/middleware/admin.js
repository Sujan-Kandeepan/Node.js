module.exports = function(request, response, next) {
  if (!request.user.isAdmin) return response.status(403).send('Access denied.');
  next();
}