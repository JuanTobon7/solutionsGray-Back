exports.up = async function (knex) {
  await knex.schema.createTable('countries', function (table) {
    table.string('id', 7).primary() // Crear una columna con un VARCHAR de longitud 7
    table.string('name', 200).notNullable() // Modificar la longitud del VARCHAR
    table.string('code', 10).notNullable() // Crear una columna con un VARCHAR de longitud 10
  }
  )
}

exports.down = async function (knex) {
  await knex.schema.dropTable('countries')
}
