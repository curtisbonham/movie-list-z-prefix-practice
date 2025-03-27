/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('movies').del()
  await knex('movies').insert([
    { title: 'Mean Girls'},
    { title: 'Hackers'},
    { title: 'The Grey'},
    { title: 'Sunshine'},
    { title: 'Ex Machina'}
  ]);
};
