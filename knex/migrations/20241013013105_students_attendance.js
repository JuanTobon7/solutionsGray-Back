exports.up = async function (knex) {
  await knex.schema.createTable('students_attendance', table => {
    table.string('id', 40).primary()
    table.string('student_id', 40).references('id').inTable('students_courses').notNullable().onDelete('CASCADE')
    table.string('chapter_id', 40).references('id').inTable('chapters_courses').notNullable().onDelete('CASCADE')
    table.timestamp('date', { useTz: true }).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('students_attendance')
}
