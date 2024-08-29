exports.up = async function (knex) {
  await knex.schema.createTable('sheeps_visits', (table) => {
    table.string('id', 40).primary()
    table.timestamp('visit_date').notNullable()
    table.text('description')
    table.string('sheep_id', 40).notNullable().references('person_id').inTable('sheeps')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('sheeps_visits')
}
