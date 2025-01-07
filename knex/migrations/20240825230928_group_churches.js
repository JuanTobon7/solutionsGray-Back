exports.up = async function (knex) {
  await knex.schema.createTable('group_churches', (table) => {
    table.string('id', 40).notNullable().primary()
    table.string('name', 256).notNullable()
    table.decimal('latitude', 11, 8).notNullable()
    table.decimal('longitude', 11, 8).notNullable()
    table.string('church_id', 40).references('id').inTable('churches')
    table.string('leader_id', 40).references('id').inTable('people')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('group_churches')
}
