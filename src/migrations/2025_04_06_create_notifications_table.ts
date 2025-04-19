import { NotificationSource } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('notifications', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('fromUserId').references('id').inTable('users').onDelete('SET NULL');
		table.integer('sysNotificationId').unsigned().references('id').inTable('sys_notifications').onDelete('CASCADE');
		table.string('title').notNullable();
		table.text('message').notNullable();
		table.enum('source', Object.values(NotificationSource)).nullable();
		table.boolean('isRead').defaultTo(false);
		table.boolean('isDeleted').defaultTo(false);
		table.timestamp('readAt');
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('notifications');
}
