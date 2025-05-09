import { Knex } from 'knex';
import { Role } from '../../src/common/constants';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('users', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid());
		table.string('firstName').notNullable();
		table.string('lastName').notNullable();
		table.string('email').notNullable().unique();
		table.string('password').nullable();
		table.string('photo');
		table.enum('role', Object.values(Role));
		table.integer('passwordResetRetries').defaultTo(0);
		table.string('passwordResetToken');
		table.timestamp('passwordResetExpires');
		table.timestamp('passwordChangedAt');
		table.string('ipAddress');
		table.integer('loginRetries').defaultTo(0);
		table.boolean('isEmailVerified').defaultTo(false);
		table.string('verificationToken').notNullable().unique();
		table.timestamp('verificationTokenExpires');
		table.string('loginToken').nullable();
		table.timestamp('loginTokenExpires');
		table.boolean('tokenIsUsed').defaultTo(false);
		table.boolean('isSuspended').defaultTo(false);
		table.boolean('isDeleted').defaultTo(false);
		table.timestamp('lastLogin').defaultTo(knex.fn.now());
		table.string('stripe_customer_id').unique();
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('users');
}
