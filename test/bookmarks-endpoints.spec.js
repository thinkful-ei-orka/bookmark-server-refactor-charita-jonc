const knex = require('knex');
const app = require('../src/app.js');

describe.only('Bookmarks Endpoints', function () {
  let db;
  let testBookmarks = [
    {
      id: 1,
      title: 'first test bookmark',
      url: 'https://www.test.com',
      rating: 3,
      description: 'test desc',
    },
    {
      id: 2,
      title: 'second test bookmark',
      url: 'https://www.test.com',
      rating: 4,
      description: 'test desc',
    },
    {
      id: 3,
      title: 'third test bookmark',
      url: 'https://www.test.com',
      rating: 2,
      description: 'test desc',
    },
  ];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks').truncate());

  afterEach('cleanup after each run', () => db('bookmarks').truncate());

  context('Given there are bookmarks in the database', () => {
    beforeEach('insert bookmarks', () => {
      return db.into('bookmarks').insert(testBookmarks);
    });
    it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testBookmarks);
    });
    it('GET /bookmarks/[id] responds with 200 of the specific bookmark', () => {
      const bookmarkId = 2;
      const expectedBookmark = testBookmarks[bookmarkId - 1];
      return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, expectedBookmark);
    });
  });
  it('Test for empty db', () => {
    return supertest(app)
      .get('/bookmarks')
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(200, []);
  });
});
