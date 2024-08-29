exports.up = async function (knex) {
  await knex.schema.createTable('types_contributions', (table) => {
    table.integer('id').primary()
    table.string('name', 50).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('types_contributions')
}
