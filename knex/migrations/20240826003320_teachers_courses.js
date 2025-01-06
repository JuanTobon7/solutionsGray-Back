exports.up = async function (knex) {
  await knex.schema.createTable('teachers_courses', (table) => {
    table.string('id', 40).primary()
    table.string('course_id', 40).references('id').inTable('courses')
    table.string('teacher_id', 40).references('id').inTable('people')
    table.string('status', ['Finalizado', 'En progreso']).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('church_courses')
}
