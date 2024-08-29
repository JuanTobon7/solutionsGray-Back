exports.up = async function (knex) {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.string('id', 40).primary()
    table.string('user_id', 40).notNullable().references('person_id').inTable('users')
    table.bigInteger('created_at')
    table.bigInteger('expires_at')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('refresh_tokens')
}
