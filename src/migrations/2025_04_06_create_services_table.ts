import { ServiceStatus } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('services', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.string('name').notNullable();
		table.text('description').notNullable();
		table.text('serviceImage').nullable();
		table.string('taskName').notNullable();
		table.string('taskTitle').notNullable();
		table.text('taskDescription').notNullable();
		table.decimal('taskPrice', 10, 2).notNullable();
		table.text('taskDetails').notNullable();
		table.text('reference').nullable();
		table.string('duration').notNullable();
		table.enum('status', Object.values(ServiceStatus)).notNullable().defaultTo(ServiceStatus.PENDING);
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('taskId').nullable().references('id').inTable('tasks').onDelete('CASCADE');
		table.boolean('isActive').notNullable().defaultTo(true);
		table.boolean('isDeleted').notNullable().defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('services');
}
