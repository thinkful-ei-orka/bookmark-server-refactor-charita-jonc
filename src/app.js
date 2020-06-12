require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config.js');
const winston = require('winston');
const BookmarksService = require('./BookmarksService.js');

const app = express();

const morganOption = NODE_ENV === 'production';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'info.log' })],
});

if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const bookmarks = [
  {
    id: 1,
    title: 'test bookmark',
    url: 'https://www.test.com',
    rating: 3,
    description: 'test desc',
  },
];

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  console.log(apiToken, authToken);
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({
      error: `Unathorized request ${(apiToken, authToken.split(' ')[1])}`,
    });
  }
  next();
});
app.use(express.json());

const { v4: uuid } = require('uuid');

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/bookmarks', (req, res, next) => {
  const knexInstance = req.app.get('db');
  BookmarksService.getAllItems(knexInstance)
    .then((bookmarks) => {
      res.json(bookmarks);
    })
    .catch(next);
});

app.get('/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  // const bookmark = bookmarks.find((c) => c.id == id);
  const knexInstance = req.app.get('db');

  // if (!bookmark) {
  //   logger.error(`Bookmark with id ${id} not found`);
  //   return res.status(404).send('Bookmark Not Found');
  // }

  BookmarksService.getById(knexInstance, id).then((bookmark) =>
    res.json(bookmark)
  );
});

app.post('/bookmarks', (req, res) => {
  console.log(req.body);
  const { title, url, rating, description } = req.body;

  if (!title) {
    logger.error('Title is required');
    return res.status(400).send('Invalid data');
  }

  if (!url) {
    logger.error('URL is required');
    return res.status(400).send('Invalid data');
  }

  if (!rating) {
    logger.error('rating is required');
    return res.status(400).send('Invalid data');
  }

  const id = uuid();

  const bookmark = {
    id,
    title,
    url,
    rating,
    description,
  };

  bookmarks.push(bookmark);

  logger.info(`Bookmark with ${id} created`);

  res
    .status(201)
    .location(`:http://localhost:8000/bookmarks/${id}`)
    .json(bookmark);
});

app.delete('/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  console.log(req.params);

  const bookmarkIndex = bookmarks.findIndex((c) => c.id == id);
  bookmarks.splice(bookmarkIndex, 1);
  if (bookmarkIndex === -1) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res.status(204).send('No content');
  }

  logger.info(`Bookmark with id ${id} deleted.`);

  res.status(204).end();
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
