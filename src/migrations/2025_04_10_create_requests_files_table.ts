import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('request_files', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.string('file').notNullable();
		table.uuid('requestId').notNullable().references('id').inTable('requests').onDelete('CASCADE');
		table.boolean('isDeleted').notNullable().defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('request_files');
}
