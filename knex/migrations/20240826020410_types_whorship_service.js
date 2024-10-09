exports.up = async function (knex) {
  await knex.schema.createTable('types_whorship_service', function (table) {
    table.increments('id').primary()
    table.string('name').notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('types_whorship_service')
}
