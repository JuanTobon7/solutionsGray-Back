exports.up = async function (knex) {
  await knex.schema.createTable('chapters_courses', table => {
    table.string('id', 40).primary()
    table.integer('numb_chapter').notNullable()
    table.string('course_id', 40).references('id').inTable('courses').notNullable().onDelete('CASCADE')
    table.string('name', 256).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('chapters_courses')
}
