// se guardarán las contribuciones de los miembros de la iglesia (ejemplo: diezmos, ofrendas, etc) en un evento
exports.up = async function (knex) {
  await knex.schema.createTable('contributions', (table) => {
    table.string('id', 40).primary()
    table.string('person_id', 40).notNullable().references('id').inTable('people')
    table.string('event_id', 40).notNullable().references('id').inTable('events')
    table.string('currency_id', 40).references('id').inTable('types_currencies')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('contributions')
}
