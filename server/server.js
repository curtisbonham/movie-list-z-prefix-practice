const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const knex = require('knex')(require('./knexfile')[process.env.NODE_ENV || 'development']);

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/movies', (req, res) => {
  knex('movies')
    .select('*')
    .then(movies => {
      res.json(movies);
    })
  })

app.post('/movies', (req, res) => {
  const {title} = req.body;
  knex('movies')
    .insert({title})
    .returning('*')
    .then(movie => {
      res.json(movie[0]);
    })
})

app.delete('/movies/:id', (req, res) => {
  const {id} = req.params
  knex('movies')
    .where({id})
    .del()
    .then(() => {
      res.status(204).send();
    })
})


app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`));