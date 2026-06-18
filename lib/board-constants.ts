// Plain shared constants — no "server-only"/"use client" directive, so both
// the server (loader, actions) and the client (board UI) can import it.

/** Spacing between task/column positions on insert — big gaps so the
 *  fractional-midpoint reorder rarely needs to renumber neighbours. */
export const POSITION_STEP = 1000;
