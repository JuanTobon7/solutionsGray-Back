exports.up = async function (knex) {
  await knex.schema.createTable('attendees', (table) => {
    table.string('id', 40).primary()
    table.string('event_id', 40).references('id').inTable('events')
    table.string('person_id', 40).references('id').inTable('people')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('attendees')
}
