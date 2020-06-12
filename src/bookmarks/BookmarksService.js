const BookmarksService = {
  getAllItems(knex) {
    return knex.select('*').from('bookmarks');
  },

  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('bookmarks')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('bookmarks').select('*').where('id', id).first();
  },
  deleteItem(knex, id) {
    return knex('bookmarks').where({ id }).delete();
  },
  updateItem(knex, id, data) {
    return knex('bookmarks').where({ id }).update(data);
  },
};
module.exports = BookmarksService;
