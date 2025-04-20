import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('transactions', (table) => {
		table.uuid('serviceId').references('id').inTable('services').onDelete('CASCADE');
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('transactions', (table) => {
		table.dropColumn('serviceId');
	});
}
