exports.up = async function (knex) {
  await knex.schema.createTable('type_contributions', function (table) {
    table.increments('id').primary()
    table.string('name', 255).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('type_contributions')
}
