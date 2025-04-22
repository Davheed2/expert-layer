import { RequestPriority, RequestStatus } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('requests', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.string('taskName').notNullable();
		table.string('taskTitle').notNullable();
		table.string('taskDescription').notNullable();
		table.string('taskDetails').notNullable();
		table.string('taskPrice').notNullable();
		table.string('transactionId').notNullable();
		table.string('duration').notNullable();
		table.string('hours').nullable();
		table.string('credits').nullable();
		table.date('dueDate').nullable();
		table.enum('status', Object.values(RequestStatus)).notNullable().defaultTo(RequestStatus.PROCESSING);
		table.enum('priority', Object.values(RequestPriority)).notNullable().defaultTo(RequestPriority.NONE);
		table.uuid('serviceId').notNullable().references('id').inTable('services').onDelete('CASCADE');
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.boolean('isDeleted').notNullable().defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('requests');
}
