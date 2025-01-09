exports.up = async function (knex) {
  await knex.schema.createTable('people', (table) => {
    table.string('id', 40).notNullable().primary()
    table.string('cc', 40).notNullable()
    table.string('first_name', 256).notNullable()
    table.string('last_name', 256).notNullable()
    table.string('email', 256).notNullable()
    table.string('phone', 256).notNullable()
    table.date('birthdate')
    table.string('type_person_id', 40).references('id').inTable('types_people')
    table.string('state_id', 40).references('id').inTable('states')
    table.string('avatar', 256)
    table.string('church_id', 40).references('id').inTable('churches').onDelete('CASCADE')

    table.unique(['cc', 'church_id'])
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('people')
}
