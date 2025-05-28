import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('wallet_topup_subscriptions', (table) => {
		table.increments('id').primary();
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.integer('amount').notNullable();
		table.string('currency').notNullable().defaultTo('usd');
		table.string('stripeCustomerId').notNullable();
		table.string('reference').notNullable();
		table.string('status').notNullable().defaultTo('active'); // active | cancelled
		table.timestamp('nextBillingDate').notNullable();
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('wallet_topup_subscriptions');
}
