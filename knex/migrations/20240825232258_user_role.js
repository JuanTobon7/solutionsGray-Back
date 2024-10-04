// Run: knex migrate:make user_role
exports.up = async function (knex) {
  await knex.schema.createTable('user_role', (table) => {
    table.integer('id').notNullable().primary()
    table.string('name', 256).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('user_role')
}
