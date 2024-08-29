// se define el tipo de rol de un servicio osea ujier, adorador, predicador, etc
exports.up = async function (knex) {
  await knex.schema.createTable('roles_services', (table) => {
    table.string('id', 40).primary()
    table.string('name', 250).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('roles_services')
}
