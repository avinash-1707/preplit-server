import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { user } from "../../db";

export async function attachProviderImageIfMissing(
  userId: string,
  image?: string | null
) {
  if (!image) return;

  const existing = await db
    .select({ image: user.image })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!existing[0]?.image) {
    await db.update(user).set({ image }).where(eq(user.id, userId));
  }
}
