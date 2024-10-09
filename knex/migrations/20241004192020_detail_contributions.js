// to save in normal format
exports.up = async function (knex) {
  await knex.schema.createTable('details_contributions', (table) => {
    table.string('id', 40).primary()
    table.string('contribution_id', 40).references('id').inTable('contributions')
    table.integer('type_contribution_id').references('id').inTable('types_contributions')
    table.decimal('amount', 10, 2).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('details_contributions')
}
