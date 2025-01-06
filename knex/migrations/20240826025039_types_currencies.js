exports.up = function (knex) {
  return knex.schema.createTable('types_currencies', function (table) {
    table.string('id', 40).primary()
    table.string('country_id', 40).references('id').inTable('countries')
    table.string('currency_type', 255).notNullable()
    table.string('currency_symbol', 255).notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('types_currencies')
}
