import { MessageStatus } from '../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('messages', (table) => {
		table.increments('id').primary();
		table.uuid('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('recipient_id').nullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('team_id').nullable().references('id').inTable('teams').onDelete('CASCADE');
		table.string('room_id').notNullable();
		table.string('room_type').notNullable();
		table.text('content').notNullable();
		table.enum('status', Object.values(MessageStatus)).defaultTo(MessageStatus.SENT);
		table.jsonb('attachments').defaultTo('[]');
		table.timestamps(true, true);

		// Indexes
		table.index('room_id');
		table.index('sender_id');
		table.index('recipient_id');
		table.index('team_id');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('messages');
}
