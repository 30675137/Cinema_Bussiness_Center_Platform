const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.fxhgyxceqrmnpezluaht',
  password: 'ppkZ8sGUEHB0qjFs',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    await client.connect();

    // Get stores table columns
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'stores'
      ORDER BY ordinal_position;
    `);

    console.log('Stores table columns:');
    console.table(res.rows);

    // Get constraints
    const constraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'stores'::regclass;
    `);

    console.log('\nConstraints:');
    console.table(constraints.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
