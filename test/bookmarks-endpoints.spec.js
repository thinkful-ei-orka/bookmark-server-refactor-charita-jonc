const knex = require('knex');
const app = require('../src/app.js');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('Bookmarks Endpoints', function () {
  let db;
  const testBookmarks = makeBookmarksArray();

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
describe(`POST /bookmarks`, () => {
  it(`creates a new article and responds with a 201`, function () {
    const newBookmark = {
      title: 'test title',
      url: 'https://www.testurl.com',
      rating: 2,
      description: 'test description',
    };
    return supertest(app)
      .post('/bookmarks')
      .send(newBookmark)
      .expect(201)
      .expect((res) => {
        expect(res.body.title).to.eql(newBookmark.title);
        expect(res.body.url).to.eql(newBookmark.url);
        expect(res.body.rating).to.eql(newBookmark.rating);
        expect(res.body.description).to.eql(newBookmark.description);
        expect(res.body).to.have.property('id');
        expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
      })
      .then((postRes) =>
        supertest(app).get(`/bookmarks/${postRes.body.id}`).expect(postRes.body)
      );
  });
});
