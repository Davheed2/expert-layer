import { Knex } from 'knex';
import { ServiceCategory } from '../common/constants';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('requests', (table) => {
		table.dropColumn('serviceCategory');
	});

	await knex.schema.alterTable('requests', (table) => {
		table.enum('serviceCategory', Object.values(ServiceCategory)).notNullable().defaultTo(ServiceCategory.DEVELOPMENT);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('requests', (table) => {
		table.dropColumn('serviceCategory');
	});

	await knex.schema.alterTable('requests', (table) => {
		table.enum('serviceCategory', Object.values(ServiceCategory)).notNullable().defaultTo(ServiceCategory.DESIGN);
	});
}
