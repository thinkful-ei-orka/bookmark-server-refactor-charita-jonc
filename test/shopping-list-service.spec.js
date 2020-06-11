const ShoppingListServer = require('../src/shopping-list-service.js');
const knex = require('knex');

describe(`Shopping List service object`, function () {
  let db;
  let testItems = [
    {
      id: 1,
      name: 'test1',
      price: '1.00',
      date_added: new Date('1919-12-22T16:28:32.615Z'),
      checked: false,
      category: 'test1-category',
    },
    {
      id: 2,
      name: 'test2',
      price: '2.00',
      date_added: new Date('1919-12-22T16:28:32.615Z'),
      checked: true,
      category: 'test2-category',
    },
    {
      id: 3,
      name: 'test3',
      price: '3.00',
      date_added: new Date('1919-12-22T16:28:32.615Z'),
      checked: false,
      category: 'test3-category',
    },
    {
      id: 4,
      name: 'test4',
      price: '4.00',
      date_added: new Date('1919-12-22T16:28:32.615Z'),
      checked: true,
      category: 'test4-category',
    },
  ];

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
  });

  before(() => db('shopping_list').truncate());

  afterEach(() => db('shopping_list').truncate());

  after(() => db.destroy());

  context('blablabla', () => {
    beforeEach(() => {
      return db.into('shopping_list').insert(testItems);
    });

    it(`resolves all items from 'shopping_list table'`, () => {
      return ShoppingListServer.getAllItems(db).then((actual) => {
        expect(actual).to.eql(
          testItems.map((item) => ({
            ...item,
            date_added: new Date(item.date_added),
          }))
        );
      });
    });
    it(`getById() gets the id of the third item`, () => {
      const thirdId = 3;
      const thirdTestItem = testItems[thirdId - 1];
      return ShoppingListServer.getById(db, thirdId).then((actual) => {
        expect(actual).to.eql({
          id: thirdId,
          name: thirdTestItem.name,
          price: thirdTestItem.price,
          date_added: thirdTestItem.date_added,
          checked: thirdTestItem.checked,
          category: thirdTestItem.category,
        });
      });
    });
    it(`deleteItem() should get the item id and delete it from db`, () => {
      const itemId = 3;
      return ShoppingListServer.deleteItem(db, itemId)
        .then(() => ShoppingListServer.getAllItems(db))
        .then((allItems) => {
          [
            {
              id: 1,
              name: 'test1',
              price: '1.00',
              date_added: new Date('1919-12-22T16:28:32.615Z'),
              checked: false,
              category: 'test1-category',
            },
            {
              id: 2,
              name: 'test2',
              price: '2.00',
              date_added: new Date('1919-12-22T16:28:32.615Z'),
              checked: true,
              category: 'test2-category',
            },

            {
              id: 4,
              name: 'test4',
              price: '4.00',
              date_added: new Date('1919-12-22T16:28:32.615Z'),
              checked: true,
              category: 'test4-category',
            },
          ];
          const expected = testItems.filter((item) => item.id !== itemId);
          expect(allItems).to.eql(expected);
        });
    });
    it(`updateItem() should get it and update`, () => {
      const idOfItemToUpdate = 3;
      const updatedItemData = {
        name: 'updated name',
        price: '4.00',
        date_added: new Date(),
        checked: true,
        category: 'updated category',
      };
      return ShoppingListServer.updateItem(
        db,
        idOfItemToUpdate,
        updatedItemData
      )
        .then(() => ShoppingListServer.getById(db, idOfItemToUpdate))
        .then((item) => {
          expect(item).to.eql({
            id: idOfItemToUpdate,
            ...updatedItemData,
          });
        });
    });
  });

  context(`shopping_list has no data`, () => {
    it(`getAllItems() is an empty array`, () => {
      return ShoppingListServer.getAllItems(db).then((actual) => {
        expect(actual).to.eql([]);
      });
    });
  });
  it(`insertItem adds new item to table and resolves with an id`, () => {
    const newItem = {
      name: 'newitem',
      price: '1.00',
      date_added: new Date('1919-12-22T16:28:32.615Z'),
      checked: false,
      category: 'newitem-category',
    };
    return ShoppingListServer.insertItem(db, newItem).then((actual) => {
      expect(actual).to.eql({
        id: 1,
        name: newItem.name,
        price: newItem.price,
        date_added: newItem.date_added,
        checked: newItem.checked,
        category: newItem.category,
      });
    });
  });
});
