import "../lib/load-env";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { user } from "../lib/db/schema";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error("Set ADMIN_EMAIL to promote a user to admin.");
    process.exit(1);
  }

  const result = await db
    .update(user)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(user.email, email))
    .returning({ username: user.username });

  if (result.length === 0) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  console.log(`@${result[0].username} is now an admin.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
