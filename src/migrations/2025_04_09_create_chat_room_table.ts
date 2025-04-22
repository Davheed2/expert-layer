import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('chat_rooms', (table) => {
		table.increments('id').primary();
		table.string('room_id').notNullable().unique();
		table.string('room_type').notNullable();
		table.uuid('team_id').nullable().references('id').inTable('teams');
		table.jsonb('metadata').defaultTo('{}');
		table.timestamps(true, true);

		// Add index for team_id
		table.index('team_id');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('chat_rooms');
}
