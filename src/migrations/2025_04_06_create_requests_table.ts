import { RequestPriority, RequestStatus, ServiceCategory } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('requests', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.string('serviceName').notNullable();
		table.string('serviceDescription').notNullable();
		table.string('servicePrice').notNullable();
		table.string('transactionId').notNullable();
		table.string('duration').notNullable();
		table.string('hours').nullable();
		table.string('credits').nullable();
		table.date('dueDate').nullable();
		table.enum('serviceCategory', Object.values(ServiceCategory)).notNullable();
		table.enum('status', Object.values(RequestStatus)).notNullable().defaultTo(RequestStatus.IN_PROGRESS);
		table.enum('priority', Object.values(RequestPriority)).notNullable().defaultTo(RequestPriority.NONE);
		table.uuid('serviceId').nullable().references('id').inTable('services').onDelete('CASCADE');
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.boolean('isDeleted').notNullable().defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('requests');
}
