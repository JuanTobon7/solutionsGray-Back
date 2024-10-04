exports.up = async function (knex) {
  await knex.schema.createTable('group_churches', (table) => {
    table.string('id', 40).notNullable().primary()
    table.string('name', 256).notNullable()
    table.string('addres', 256).notNullable()
    table.string('church_id', 40).references('id').inTable('churches')
    table.string('strategy_id', 40).references('id').inTable('strategies')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('group_churches')
}
