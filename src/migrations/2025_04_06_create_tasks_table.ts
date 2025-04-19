import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('task').notNullable();
    table.string('taskImage').notNullable();
    table.boolean('isDeleted').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('task_details', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('taskId').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.boolean('popular').notNullable().defaultTo(false);
    table.boolean('isDeleted').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task_details');
  await knex.schema.dropTableIfExists('tasks');
}
