import "server-only";
import { count, desc, eq, gte, ne, type SQL } from "drizzle-orm";
import { type PgTable } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { pageViews, users, submissions, applications, posts, teams, teamTasks } from "@/db/schema";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function countRows(table: PgTable, where?: SQL): Promise<number> {
  const base = db().select({ c: count() }).from(table);
  const [row] = where ? await base.where(where) : await base;
  return Number(row?.c ?? 0);
}

export type Analytics = {
  views: { total: number; last7: number; last30: number; top: { path: string; c: number }[] };
  counts: { employees: number; leads: number; applications: number; posts: number; teams: number; openTasks: number };
  tasksByStatus: { status: string; c: number }[];
};

/** Everything the admin dashboard shows. Resilient — returns zeros on DB error. */
export async function getAnalytics(): Promise<Analytics> {
  try {
    const [total, last7, last30, top, employees, leads, applics, postCount, teamCount, openTasks, byStatus] = await Promise.all([
      countRows(pageViews),
      countRows(pageViews, gte(pageViews.createdAt, daysAgo(7))),
      countRows(pageViews, gte(pageViews.createdAt, daysAgo(30))),
      db().select({ path: pageViews.path, c: count() }).from(pageViews).groupBy(pageViews.path).orderBy(desc(count())).limit(5),
      countRows(users, eq(users.disabled, false)),
      countRows(submissions),
      countRows(applications),
      countRows(posts, eq(posts.status, "published")),
      countRows(teams),
      countRows(teamTasks, ne(teamTasks.status, "done")),
      db().select({ status: teamTasks.status, c: count() }).from(teamTasks).groupBy(teamTasks.status),
    ]);

    return {
      views: { total, last7, last30, top },
      counts: { employees, leads, applications: applics, posts: postCount, teams: teamCount, openTasks },
      tasksByStatus: byStatus,
    };
  } catch (err) {
    console.error("getAnalytics failed:", err);
    return {
      views: { total: 0, last7: 0, last30: 0, top: [] },
      counts: { employees: 0, leads: 0, applications: 0, posts: 0, teams: 0, openTasks: 0 },
      tasksByStatus: [],
    };
  }
}
