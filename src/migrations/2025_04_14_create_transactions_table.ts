import { TransactionStatus, TransactionType } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('transactions', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
		table.integer('amount').notNullable();
		table.integer('walletBalanceBefore').nullable();
		table.integer('walletBalanceAfter').nullable();
        table.string('description').notNullable();
		table.string('reference').notNullable();
		table.enum('type', Object.values(TransactionType)).notNullable();
		table.enum('status', Object.values(TransactionStatus)).notNullable().defaultTo(TransactionStatus.PENDING);
		table.string('stripePaymentIntentId').nullable();
		table.jsonb('metadata').defaultTo('{}');
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('transactions');
}
