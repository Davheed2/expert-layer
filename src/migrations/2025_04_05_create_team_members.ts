import { Knex } from 'knex';
import { Role } from '../common/constants';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('team_members', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('teamId').references('id').inTable('teams').onDelete('CASCADE');
		table.uuid('ownerId').references('id').inTable('users').onDelete('CASCADE');
		table.uuid('memberId').references('id').inTable('users').onDelete('CASCADE');
		table.enum('memberType', Object.values(Role));
		table.boolean('isDeleted').defaultTo(false);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('team_members');
}
