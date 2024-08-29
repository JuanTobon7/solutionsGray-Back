exports.up = async function (knex) {
  await knex.schema.createTable('church_courses', (table) => {
    table.string('id', 40).primary()
    table.string('course_id', 40).references('id').inTable('courses')
    table.string('church_id', 40).references('id').inTable('churches')
    table.string('teacher_id', 40).references('id').inTable('people')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('church_courses')
}
