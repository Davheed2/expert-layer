import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('request_comments', (table) => {
		table.text('comment').notNullable().alter();
	});
}

export async function down(knex: Knex): Promise<void> {
	// Optional: reverse the alteration if needed
	// If there was a previous state (e.g., nullable), revert to that
	await knex.schema.alterTable('request_comments', (table) => {
		table.text('comment').nullable().alter(); // or whatever the original was
	});
}
