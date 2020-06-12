const express = require('express');
const BookmarksService = require('./BookmarksService');

const bookmarksRouter = express.Router();
const jsonParser = express.json();

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then((bookmarks) => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, rating, description } = req.body;
    const newBookmark = { title, url, rating, description };
    BookmarksService.insertItem(req.app.get('db'), newBookmark)
      .then((bookmark) => {
        res.status(201).location(`/bookmarks/${bookmark.id}`).json(bookmark);
      })
      .catch(next);
  });

bookmarksRouter.route('/:id').get((req, res, next) => {
  const knexInstance = req.app.get('db');
  BookmarksService.getById(knexInstance, req.params.id)
    .then((bookmark) => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: `Bookmark doesn't exist` },
        });
      }
      res.json(bookmark);
    })
    .catch(next);
});

module.exports = bookmarksRouter;
