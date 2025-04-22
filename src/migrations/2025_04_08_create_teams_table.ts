import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('teams', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.string('name').notNullable();
		table.uuid('ownerId').references('id').inTable('users').onDelete('CASCADE');
		table.boolean('isDeleted').defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('teams');
}
