import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('activities', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.uuid('requestId').nullable().references('id').inTable('requests').onDelete('CASCADE');
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.string('activity').notNullable();
        table.string('activityDescription').notNullable();
		table.boolean('isDeleted').notNullable().defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('activities');
}
