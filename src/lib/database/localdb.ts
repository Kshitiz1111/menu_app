import { Pool } from "pg";

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 3306, // default Postgres port
  database: 'menu_db'
});

export async function connectClientLocally() {
  let client
  try {
    client = await pool.connect();
    return client;
  } catch (error) {
    console.error('local menu_app db connection error:', error);
    throw error; // Connection failed, throw error
  } finally {
    client?.release(); // Release the client back to the pool
  }
}