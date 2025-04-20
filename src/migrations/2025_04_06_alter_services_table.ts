import { ServiceType } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('services', (table) => {
		table.enum('type', Object.values(ServiceType)).notNullable().defaultTo(ServiceType.ONE_TIME);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('services', (table) => {
		table.dropColumn('type');
	});
}
