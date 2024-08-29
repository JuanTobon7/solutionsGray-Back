exports.up = async function (knex) {
  await knex.schema.createTable('types_people', (table) => {
    table.string('id', 40).notNullable().primary()
    table.string('name', 256).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('types_people')
}
