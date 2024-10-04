exports.up = async function (knex) {
  await knex.schema.createTable('church_pastor', (table) => {
    table.string('pastor_id', 40).references('id').inTable('people')
    table.string('church_id', 40).references('id').inTable('churches')
    table.primary(['pastor_id', 'church_id'])
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('church_pastor')
}
