exports.up = async function(knex) {
    await knex.schema.createTable('roles_administratives', function(table) {
        table.integer('id').primary().notNullable();
        table.string('name', 200).notNullable();
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTable('roles_administratives');
};
