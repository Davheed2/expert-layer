import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('transactions', (table) => {
		table.integer('serviceId').notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('transactions', (table) => {
		table.dropColumn('serviceId');
	});
}
