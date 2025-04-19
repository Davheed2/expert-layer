import { NotificationType, NotificationSource } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('sys_notifications', (table) => {
		table.increments('id').primary();
		table.string('title').notNullable();
		table.text('body').notNullable();
		table.enum('type', Object.values(NotificationType)).notNullable().defaultTo(NotificationType.INAPP);
		table.enum('source', Object.values(NotificationSource)).notNullable().defaultTo(NotificationSource.SYSTEM);
		table.boolean('isActive').defaultTo(true);
		table.boolean('isUserConfigurable').defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('sys_notifications');
}
