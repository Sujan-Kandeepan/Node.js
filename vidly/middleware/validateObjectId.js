const mongoose = require('mongoose');

module.exports = function(request, response, next) {
  if (!mongoose.Types.ObjectId.isValid(request.params.id))
    return response.send(404).send('Invalid ID.');
  
  next();
};
