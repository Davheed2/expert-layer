import {
	ServiceStatus,
	ServiceType,
	ServicePricing,
	ServiceRequestAllocation,
	ServiceCategory,
} from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('services', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.string('name').notNullable();
		table.string('description').notNullable();
		table.string('serviceImage').nullable();
		table.decimal('price', 10, 2).notNullable();
		table.string('hours').nullable();
		table.integer('credits').nullable();
		table.enum('status', Object.values(ServiceStatus)).notNullable().defaultTo(ServiceStatus.DRAFT);
		table.enum('type', Object.values(ServiceType)).notNullable().defaultTo(ServiceType.ONE_OFF);
		table.enum('pricingDetails', Object.values(ServicePricing)).notNullable();
		table.string('purchaseLimit').nullable();
		table.enum('allocation', Object.values(ServiceRequestAllocation)).nullable();
		table.enum('category', Object.values(ServiceCategory)).notNullable();
		table.integer('maxRequest').nullable();
		table.boolean('isDefault').notNullable().defaultTo(false);
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.boolean('isDeleted').notNullable().defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('services');
}
