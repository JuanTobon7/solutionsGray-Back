exports.up = async function(knex) {
  await knex.schema.createTable('states', function(table) {
      table.string('id', 40).notNullable();
      table.string('name', 255).notNullable();
      table.string('country_id', 40).notNullable();
      
      // Definir la clave primaria compuesta
      table.primary(['country_id', 'id']);
      
      // Definir la clave foránea
      table.foreign('country_id').references('id').inTable('countries');
  });
};

exports.down = async function(knex) {
await knex.schema.dropTable('states');
};
