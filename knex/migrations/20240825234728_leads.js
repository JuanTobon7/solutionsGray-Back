exports.up = async function (knex) {
  await knex.schema.createTable('leads', (table) => {
    table.string('person_id').primary().references('id').inTable('people').onDelete('CASCADE')
    table.string('church_name').notNullable() // recordar que aun no se ha creado  registro de la iglesia
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('leads')
}
