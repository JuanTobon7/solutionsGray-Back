exports.up = async function (knex) {
  await knex.schema.createTable('courses', function (table) {
    table.string('id', 40).primary() // Crear una columna con un VARCHAR de longitud 7
    table.string('name', 255).notNullable() // Modificar la longitud del VARCHAR
    table.text('description').notNullable() // descripcion del libro
    table.string('publisher', 255).notNullable() // editorial del libro
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('courses')
}
