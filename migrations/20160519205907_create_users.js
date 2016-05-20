
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments('id')
    table.string('fb_id')
    table.text('firstName')
    table.text('lastName')
    table.text('email')
    table.string('profilepicture')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
