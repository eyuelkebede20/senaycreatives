import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, subscriptions, creditLedger, submissions, packages } from "@/db/schema";
import { sendEmail, sendNotification } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In a real integration, we would verify the Chapa signature using crypto and our secret key.
    // For this implementation, we accept the JSON payload simulating the successful payment.
    const { submissionId, packageSlug, status, txRef } = body;
    
    if (status !== "success") {
      return NextResponse.json({ ok: false, error: "Payment not successful" }, { status: 400 });
    }

    if (!submissionId) {
      return NextResponse.json({ ok: false, error: "Missing submissionId" }, { status: 400 });
    }

    // 1. Look up the submission
    const [sub] = await db().select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
    if (!sub) {
      return NextResponse.json({ ok: false, error: "Submission not found" }, { status: 404 });
    }

    // 2. Check if client already exists
    let [client] = await db()
      .select()
      .from(clients)
      .where(eq(clients.sourceSubmissionId, submissionId))
      .limit(1);

    if (!client) {
      // 3. Create the Client
      const [newClient] = await db()
        .insert(clients)
        .values({
          name: sub.name,
          org: sub.company ?? null,
          contactEmail: sub.email,
          contactPhone: sub.phone ?? null,
          sourceSubmissionId: sub.id,
          status: "active",
          notes: sub.message,
        })
        .returning();
      client = newClient;
    } else {
      // Ensure status is active
      await db().update(clients).set({ status: "active" }).where(eq(clients.id, client.id));
    }

    // 4. Create the Subscription and deposit credits
    // In our simplified package model, we'll assign credits based on the package.
    // For safety, default to 15 credits if the package isn't found in DB.
    let grantedCredits = 15;
    let dbPackageId = null;
    
    if (packageSlug) {
      const [pkg] = await db().select().from(packages).where(eq(packages.slug, packageSlug)).limit(1);
      if (pkg) {
        dbPackageId = pkg.id;
        grantedCredits = pkg.monthlyCredits ?? 15;
      }
    }

    // Check if a subscription already exists to be idempotent
    const [existingSub] = await db()
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clientId, client.id))
      .limit(1);

    if (!existingSub) {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const minTerm = new Date(now);
      minTerm.setMonth(minTerm.getMonth() + 3);

      await db().insert(subscriptions).values({
        clientId: client.id,
        packageId: dbPackageId,
        status: "active",
        startedAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        minTermEndsAt: minTerm,
      });

      // 5. Deposit the first month of credits
      await db().insert(creditLedger).values({
        clientId: client.id,
        delta: grantedCredits,
        reason: "period_grant",
        // System deposit has no createdBy (null)
      });
      
      // Send a welcome email
      try {
        await sendEmail({
          to: client.contactEmail,
          subject: "Payment Received - Welcome to SenayCreatives!",
          text: `Hi ${client.name},\n\nYour payment was successful and your subscription is now active with ${grantedCredits} credits deposited to your account.\n\nWe look forward to working with you!\n\nBest,\nThe SenayCreatives Team`,
        });
      } catch (e) {}
    }

    return NextResponse.json({ ok: true, clientId: client.id });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
