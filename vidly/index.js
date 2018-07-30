const Joi = require('joi');
const express = require('express');
const app = express();

const genres = [
  { id: 1, name: 'action' },
  { id: 2, name: 'horror' },
  { id: 3, name: 'comedy' }
];

app.use(express.json());

app.get('/', (request, response) => {
  response.send('Vidly');
});

app.get('/api/genres', (request, response) => {
  response.send(genres);
});

app.get('/api/genres/:id', (request, response) => {
  const genre = genres.find(g => g.id === parseInt(request.params.id));
  if (!genre) return response.status(404).send('The genre with the given ID was not found');
  else response.send(genre);
});

app.post('/api/genres/', (request, response) => {
  const { error } = validateGenre(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const genre = {
    id: genres.length + 1,
    name: request.body.name
  };

  genres.push(genre);
  response.send(genre);
});

app.put('/api/genres/:id', (request, response) => {
  const genre = genres.find(g => g.id === parseInt(request.params.id));
  if (!genre) return response.status(404).send('The genre with the given ID was not found');
  
  const { error } = validateGenre(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  genre.name = request.body.name;
  response.send(genre);
});

app.delete('/api/genres/:id', (request, response) => {
  const genre = genres.find(g => g.id === parseInt(request.params.id));
  if (!genre) return response.status(404).send('The genre with the given ID was not found');

  const index = genres.indexOf(genre);
  genres.splice(index, 1);

  response.send(genre);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(genre, schema);
}
