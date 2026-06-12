import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts last-wins. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a price in ETB — the only currency. e.g. 15000 → "ETB 15,000". */
export function formatETB(amount: number) {
  return `ETB ${new Intl.NumberFormat("en-US").format(amount)}`;
}
