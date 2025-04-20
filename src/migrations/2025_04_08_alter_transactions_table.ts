import { TransactionStatus } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('transactions', (table) => {
		table.enum('status', Object.values(TransactionStatus)).notNullable().defaultTo(TransactionStatus.PENDING);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('transactions', (table) => {
		table.dropColumn('status');
	});
}
