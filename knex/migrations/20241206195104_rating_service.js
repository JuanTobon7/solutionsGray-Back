/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('rating_services', (table) => {
    table.string('id', 40).primary()
    table.string('service_id', 40).references('id').inTable('services').notNullable()
    table.string('person_qualifier_id', 40).references('id').inTable('people').notNullable()
    table.integer('rating').notNullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable('rating_service')
}
