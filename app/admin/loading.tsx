import { Container } from "@/components/ui/container";

// Shown while a dynamic /admin page fetches from the DB on navigation.
export default function AdminLoading() {
  return (
    <main className="flex-1">
      <Container className="py-10">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-paper-dim" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-paper-dim" />
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-paper-dim" />
          ))}
        </div>
      </Container>
    </main>
  );
}
