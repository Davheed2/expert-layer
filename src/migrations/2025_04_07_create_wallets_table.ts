import { CurrencyType } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('wallets', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
		table.integer('balance').notNullable().defaultTo(0);
		table.enum('currency', Object.values(CurrencyType)).notNullable().defaultTo(CurrencyType.USD);
		table.boolean('isDeleted').notNullable().defaultTo(false);
		table.boolean('isSuspended').notNullable().defaultTo(false);
		table.timestamps(true, true);
		table.unique(['userId']);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('wallets');
}