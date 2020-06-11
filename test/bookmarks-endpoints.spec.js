const { expect } = require('chai');
const knex = require('knex')
const app = require('../src/app')

describe('Bookmarks Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    context('Given there are bookmarks in the database', () => {
        const testBookmarks = [
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
        ]
        this.beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        })
        it('GET / responds with 200 and all of the bookmarks', () => {
            return supertest(app).get('/bookmarks').expect(200);
        });
    });
});