exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.string('person_id', 40).primary().references('id').inTable('people')
    table.string('password', 300).notNullable()
    table.integer('rol_user_id').references('id').inTable('user_role')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('users')
}
