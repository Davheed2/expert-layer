import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('requests', (table) => {
		table.text('serviceDescription').alter();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('requests', (table) => {
		table.string('serviceDescription', 255).alter();
	});
}
