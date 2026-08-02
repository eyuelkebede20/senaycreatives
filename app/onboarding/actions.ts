"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function submitOnboarding(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "worker") {
    throw new Error("Only workers can onboard.");
  }
  if (user.onboardedAt) {
    redirect("/work");
  }

  const tin = formData.get("tin")?.toString().trim();
  const paymentDetails = formData.get("paymentDetails")?.toString().trim();
  const ndaAgreed = formData.get("ndaAgreed") === "on";
  const equipmentAgreed = formData.get("equipmentAgreed") === "on";

  if (!tin || !paymentDetails || !ndaAgreed || !equipmentAgreed) {
    throw new Error("Please complete all required fields and agreements.");
  }

  await db()
    .update(users)
    .set({
      tin,
      paymentDetails,
      ndaSignedAt: new Date(),
      onboardedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  redirect("/work");
}
