import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('request_comments', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('requestId').notNullable().references('id').inTable('requests').onDelete('CASCADE');
        table.string('comment').notNullable();
		table.boolean('isDeleted').notNullable().defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('request_comments');
}
