// Swappable realtime transport for the kanban board.
//
// Phase 2 ships POLLING as the default transport because WebSocket support on
// the shared host is unverified (see CLAUDE.md). The board UI talks only to the
// BoardTransport interface, so swapping in a WebSocket transport later is a
// one-line change in `createBoardTransport` — no UI rework.
//
// Client-safe: no server-only imports here. Types are shared with the server
// loader (lib/boards.ts) and the polling GET route.

"use client";

import { useEffect, useRef, useState } from "react";

// ── Shared snapshot shape (server loader returns exactly this) ───────────────

export type BoardMember = { id: string; name: string };

export type BoardTask = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: string | null; // ISO string
  position: number;
};

export type BoardColumnView = {
  id: string;
  name: string;
  position: number;
};

export type BoardSnapshot = {
  board: { id: string; name: string; description: string | null };
  columns: BoardColumnView[];
  tasks: BoardTask[];
  members: BoardMember[];
  /** Monotonic-ish marker (max updatedAt epoch) so we can skip no-op renders. */
  version: number;
};

// ── Transport interface ──────────────────────────────────────────────────────

export interface BoardTransport {
  /** Begin receiving snapshots for a board. Returns an unsubscribe function. */
  subscribe(boardId: string, onUpdate: (snap: BoardSnapshot) => void): () => void;
}

const POLL_INTERVAL_MS = 4000;

/** Polling transport — fetches the snapshot endpoint on an interval. */
class PollingTransport implements BoardTransport {
  subscribe(boardId: string, onUpdate: (snap: BoardSnapshot) => void): () => void {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const res = await fetch(`/api/admin/boards/${boardId}`, { cache: "no-store" });
        if (res.ok) {
          const snap = (await res.json()) as BoardSnapshot;
          if (!stopped) onUpdate(snap);
        }
      } catch {
        // transient — next tick retries
      }
      if (!stopped) timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    timer = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }
}

/** The active transport. Swap this for a WebSocket transport once verified. */
export function createBoardTransport(): BoardTransport {
  return new PollingTransport();
}

/**
 * Subscribe to a board and keep the latest snapshot in state. Seeded with the
 * server-rendered snapshot so the first paint is instant; polling then layers
 * in other people's changes. Pauses while the tab is hidden.
 */
export function useBoardSync(boardId: string, initial: BoardSnapshot): BoardSnapshot {
  const [snapshot, setSnapshot] = useState(initial);
  const versionRef = useRef(initial.version);

  useEffect(() => {
    const transport = createBoardTransport();
    const unsubscribe = transport.subscribe(boardId, (snap) => {
      // Ignore stale snapshots so an in-flight local edit isn't clobbered.
      if (snap.version >= versionRef.current) {
        versionRef.current = snap.version;
        setSnapshot(snap);
      }
    });
    return unsubscribe;
  }, [boardId]);

  return snapshot;
}
