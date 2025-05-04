import { Knex } from 'knex';
import { RequestDurationType } from '../common/constants';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('requests', (table) => {
		table
			.enum('durationType', Object.values(RequestDurationType))
			.notNullable()
			.defaultTo(RequestDurationType.STANDARD);
		table.integer('durationAmount').notNullable().defaultTo(0);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('requests', (table) => {
		table.dropColumn('durationType');
		table.dropColumn('durationAmount');
	});
}
