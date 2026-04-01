import 'dotenv/config';
import { db } from './db';
import { userSalesforceProfiles } from './db/schema';

async function checkProfiles() {
  const p = await db.select().from(userSalesforceProfiles);
  console.log('Total profiles:', p.length);
  p.forEach(pr => console.log(`- UserID: ${pr.userId}, ContactID: ${pr.contactId}`));
  process.exit();
}

checkProfiles();
