exports.up = async function (knex) {
  await knex.schema.createTable('teachers_courses', (table) => {
    table.string('id', 40).primary()
    table.string('course_id', 40).references('id').inTable('courses')
    table.string('teacher_id', 40).references('id').inTable('people')
    table.string('status').enum(['Finalizado', 'En progreso']).notNullable()
    table.time('start_time').notNullable()
    table.time('end_time').notNullable()
    table.string('day').enum(['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('church_courses')
}
