exports.up = async function (knex) {
  await knex.schema.createTable('churches', (table) => {
    table.string('id', 40).notNullable().primary()
    table.string('name', 250).notNullable()
    table.string('parent_church_id', 40).references('id').inTable('churches')
    table.decimal('latitude', 10, 7)
    table.decimal('longitude', 10, 7)
    table.string('state_id', 40)
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('churches')
}
