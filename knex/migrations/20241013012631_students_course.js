exports.up = async function (knex) {
  await knex.schema.createTable('students_courses', table => {
    table.string('id', 40).primary()
    table.string('student_id', 40).references('id').inTable('people').notNullable().onDelete('CASCADE')
    table.string('teachers_courses_id', 40).references('id').inTable('teachers_courses').notNullable().onUpdate('CASCADE')
    table.string('status', 40).notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('students_courses')
}
