import { config } from 'dotenv';
config({ path: '.env' });
import pg from 'pg';

async function main() {
  const { Client } = pg;
  const client = new Client({ connectionString: 'postgres://postgres:password123@localhost:5432/wovn_web_db' });
  await client.connect();
  
  // get a user
  const userRes = await client.query(`SELECT id FROM users LIMIT 1`);
  if (userRes.rows.length === 0) return console.log("No users");
  const contactId = userRes.rows[0].id; // mock
  
  // We can't easily get the salesforce token without the full next.js env.
  // Actually, I can just write a Next.js server component / route to dump it, or just use curl to the local dev server!
  console.log("Use curl to local dev server!");
  client.end();
}
main();
