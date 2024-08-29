exports.up = async function (knex) {
  await knex.schema.createTable('events', (table) => {
    table.string('id', 40).primary()
    table.string('name').notNullable()
    table.string('sermon_tittle').notNullable()
    table.timestamp('date', { useTz: false }).notNullable()
    table.string('church_id', 40).references('id').inTable('churches')
    table.string('group_id', 40).references('id').inTable('group_churches')
    table.string('description', 255)
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('events')
}
