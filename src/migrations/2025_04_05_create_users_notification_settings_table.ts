import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('user_notification_settings', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
		table.integer('sysNotificationId').unsigned().references('id').inTable('sys_notifications').onDelete('CASCADE');
		table.boolean('enabled').defaultTo(true); // if false, they opt-out of this specific notification
		table.timestamps(true, true);

		table.unique(['userId', 'sysNotificationId']); 
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('user_notification_settings');
}
