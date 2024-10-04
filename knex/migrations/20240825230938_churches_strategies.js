exports.up = async function (knex) {
  await knex.schema.createTable('churches_strategies', (table) => {
    table.string('church_id', 40).notNullable().references('id').inTable('churches')
    table.string('strategy_id', 40).notNullable().references('id').inTable('strategies')
    table.primary(['church_id', 'strategy_id'])
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('churches_strategies')
}
