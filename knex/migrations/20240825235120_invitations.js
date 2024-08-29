exports.up = async function (knex) {
  await knex.schema.createTable('invitations', (table) => {
    table.string('person_id', 40).primary().references('id').inTable('people').onDelete('CASCADE')
    table.string('inviter_id', 40).references('id').inTable('people').onDelete('CASCADE')
    table.bigInteger('created_at').notNullable()
    table.bigInteger('updated_at').notNullable()
    table.enum('status', ['pendiente', 'aceptado', 'rechazo']).notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('invitations')
}
