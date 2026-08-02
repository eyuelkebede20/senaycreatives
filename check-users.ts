import { db } from "./lib/db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
async function run() {
  const allUsers = await db().select().from(users);
  console.log("All users:", allUsers.map(u => ({ email: u.email, role: u.role, disabled: u.disabled })));
  
  const employees = await db().select().from(users).where(eq(users.disabled, false));
  console.log("Employees (disabled=false):", employees.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
}
run();
