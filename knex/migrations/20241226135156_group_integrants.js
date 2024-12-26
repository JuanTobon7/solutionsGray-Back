exports.up = async function (knex) {
  await knex.schema.createTable('group_integrants', (table) => {
    table.string('id', 40).notNullable().primary()
    table.string('group_id', 40).references('id').inTable('group_churches')
    table.string('person_id', 40).references('id').inTable('people')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('group_integrants')
}
