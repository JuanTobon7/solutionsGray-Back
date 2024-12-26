exports.up = async function (knex) {
  await knex.schema.createTable('strategies', function (table) {
    table.string('id', 40).primary()
    table.string('name', 255).notNullable()
    table.string('group_id', 40).references('id').inTable('group_churches')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('strategies')
}
