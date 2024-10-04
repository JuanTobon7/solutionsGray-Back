exports.up = async function (knex) {
  await knex.schema.createTable('entity_courses', (table) => {
    table.string('id', 40).primary()
    table.string('student_id', 40).references('id').inTable('people')
    table.enum('status', ['en progreso', 'completado', 'reprobado']).notNullable().defaultTo('en progreso')
    table.text('progress')
    table.date('started_at').notNullable()
    table.date('updated_at')
    table.string('course_id', 40).notNullable().references('id').inTable('church_courses')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('entity_courses')
}
