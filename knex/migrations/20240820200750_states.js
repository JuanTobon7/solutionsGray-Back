exports.up = async function (knex) {
  await knex.schema.createTable('states', function (table) {
    table.string('id', 40).primary()
    table.string('name', 255).notNullable()
    table.string('short_name', 255).notNullable()
    table.string('country_id', 40).notNullable()
    table.foreign('country_id').references('id').inTable('countries')
  })
}

exports.down = async function (knex) {
  // drop table if not exists
  await knex.schema.dropTableIfExists('states')
}
