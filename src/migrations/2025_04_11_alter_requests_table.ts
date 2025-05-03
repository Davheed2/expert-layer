import { Knex } from 'knex';
import { RequestStatus } from '../common/constants';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('requests', (table) => {
		table.dropColumn('status');
	});

	await knex.schema.alterTable('requests', (table) => {
		table.enum('status', Object.values(RequestStatus)).notNullable().defaultTo(RequestStatus.DRAFT);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('requests', (table) => {
		table.dropColumn('status');
	});

	await knex.schema.alterTable('requests', (table) => {
		table.enum('status', Object.values(RequestStatus)).notNullable().defaultTo(RequestStatus.IN_PROGRESS);
	});
}
