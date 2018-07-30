const express = require('express');
const router = express.Router();

const genres = [
  { id: 1, name: 'action' },
  { id: 2, name: 'horror' },
  { id: 3, name: 'comedy' }
];

router.get('/', (request, response) => {
  response.send(genres);
});

router.get('/:id', (request, response) => {
  const genre = genres.find(g => g.id === parseInt(request.params.id));
  if (!genre) return response.status(404).send('The genre with the given ID was not found');
  else response.send(genre);
});

router.post('/', (request, response) => {
  const { error } = validateGenre(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const genre = {
    id: genres.length + 1,
    name: request.body.name
  };

  genres.push(genre);
  response.send(genre);
});

router.put('/:id', (request, response) => {
  const genre = genres.find(g => g.id === parseInt(request.params.id));
  if (!genre) return response.status(404).send('The genre with the given ID was not found');
  
  const { error } = validateGenre(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  genre.name = request.body.name;
  response.send(genre);
});

router.delete('/:id', (request, response) => {
  const genre = genres.find(g => g.id === parseInt(request.params.id));
  if (!genre) return response.status(404).send('The genre with the given ID was not found');

  const index = genres.indexOf(genre);
  genres.splice(index, 1);

  response.send(genre);
});

function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(genre, schema);
}

module.exports = router;
