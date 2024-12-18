// se guardarán las contribuciones de los miembros de la iglesia (ejemplo: diezmos, ofrendas, etc) en un evento
exports.up = async function (knex) {
  await knex.schema.createTable('contributions', (table) => {
    table.string('id', 40).primary()
    table.string('person_id', 40).notNullable().references('id').inTable('people')
    table.string('event_id', 40).notNullable().references('id').inTable('events')
    table.integer('type_contribution_id').notNullable().references('id').inTable('types_contributions')
    table.float('amount').notNullable()
    table.string('currency_type').notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('contributions')
}
