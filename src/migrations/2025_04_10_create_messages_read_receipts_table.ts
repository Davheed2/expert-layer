import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('message_read_receipts', (table) => {
		table.increments('id').primary();
		table.integer('message_id').notNullable().references('id').inTable('messages').onDelete('CASCADE');
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.timestamp('read_at').notNullable();
		table.timestamp('created_at').defaultTo(knex.fn.now());

		// Compound unique constraint
		table.unique(['message_id', 'user_id']);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('message_read_receipts');
}
