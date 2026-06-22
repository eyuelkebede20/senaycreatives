import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teams, teamMembers, teamTasks, users, type TeamTask } from "@/db/schema";

export type Employee = { id: string; name: string; email: string; role: "manager" | "admin" };
export type Member = { id: string; name: string; email: string };
export type TeamWithMembers = { id: string; name: string; description: string | null; members: Member[] };

/** All active employees (assignable to teams). */
export async function listEmployees(): Promise<Employee[]> {
  return db()
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.disabled, false))
    .orderBy(asc(users.name));
}

/** All teams with their members (for the drag-and-drop board). */
export async function listTeamsWithMembers(): Promise<TeamWithMembers[]> {
  const [teamRows, memberRows] = await Promise.all([
    db().select().from(teams).orderBy(asc(teams.name)),
    db()
      .select({ teamId: teamMembers.teamId, id: users.id, name: users.name, email: users.email })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .orderBy(asc(users.name)),
  ]);

  const byTeam = new Map<string, Member[]>();
  for (const m of memberRows) {
    const list = byTeam.get(m.teamId) ?? [];
    list.push({ id: m.id, name: m.name, email: m.email });
    byTeam.set(m.teamId, list);
  }
  return teamRows.map((t) => ({ id: t.id, name: t.name, description: t.description, members: byTeam.get(t.id) ?? [] }));
}

/** A single team with members + tasks. */
export async function getTeam(id: string) {
  const [team] = await db().select().from(teams).where(eq(teams.id, id)).limit(1);
  if (!team) return null;
  const [members, tasks] = await Promise.all([
    db()
      .select({ id: users.id, name: users.name, email: users.email })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, id))
      .orderBy(asc(users.name)),
    db().select().from(teamTasks).where(eq(teamTasks.teamId, id)).orderBy(desc(teamTasks.createdAt)),
  ]);
  return { team, members: members as Member[], tasks: tasks as TeamTask[] };
}

/** Member emails for a team (used when assigning a task). */
export async function teamMemberContacts(teamId: string): Promise<Member[]> {
  return db()
    .select({ id: users.id, name: users.name, email: users.email })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));
}
