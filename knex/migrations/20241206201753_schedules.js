/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('schedules', (table) => {
    table.string('id', 40).primary()
    table.string('teacher_course_id', 40).references('id').inTable('teachers_courses').notNullable()
    table.string('day', 40).notNullable()
    table.time('start_time').notNullable()
    table.time('end_time').notNullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable('schedules')
}
