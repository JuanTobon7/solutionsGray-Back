// aqui se guardará el rol que desempeño una persona en un servicio (ejemplo: ujier, adorador, predicador, etc)
exports.up = async function (knex) {
  await knex.schema.createTable('services', (table) => {
    table.string('id', 40).primary()
    table.string('servant_id', 40).notNullable().references('id').inTable('people')
    table.string('rol_servant_id', 40).notNullable().references('id').inTable('roles_services')
    table.string('event_id', 40).references('id').inTable('events')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('services')
}
