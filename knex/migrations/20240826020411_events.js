exports.up = async function (knex) {
  await knex.schema.createTable('events', (table) => {
    table.string('id', 40).primary()
    table.string('sermon_tittle').notNullable()
    table.timestamp('date', { useTz: true }).notNullable()
    table.string('church_id', 40).references('id').inTable('churches')
    table.string('group_id', 40).references('id').inTable('group_churches')
    table.integer('worship_service_type_id').references('id').inTable('types_whorship_service')
    table.string('description', 255)
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('events')
}
