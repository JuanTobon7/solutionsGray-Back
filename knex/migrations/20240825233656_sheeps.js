exports.up = async function (knex) {
  await knex.schema.createTable('sheeps', (table) => {
    table.string('person_id').primary().references('id').inTable('people').onDelete('CASCADE')
    // i want add default to status = 'activo'
    table.enu('status', ['activo', 'inactivo']).defaultTo('activo')
    table.string('description') // Estado espiritual en el que llegó
    table.string('guide_id', 40).references('id').inTable('people').onDelete('CASCADE')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('sheeps')
}
