exports.up = async function(knex) {
    await knex.schema.createTable('roles_servants', function(table) {
        table.string('id', 40).primary().notNullable();
        table.string('name', 255).notNullable();
    })
};


exports.down = async function(knex) {
  await knex.schema.dropTable('roles_servants');
};
