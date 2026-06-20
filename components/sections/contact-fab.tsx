import { contact } from "@/content/contact";

// Floating chat buttons (bottom-right). Renders only the channels that are set
// in content/contact.ts — empty value = hidden. Server component (plain links).
export function ContactFab() {
  const wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : null;
  const tg = contact.telegram ? `https://t.me/${contact.telegram}` : null;
  if (!wa && !tg) return null;

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-2 print:hidden">
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
          className="grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
            <path d="M.06 24l1.69-6.16a11.87 11.87 0 0 1-1.6-5.96C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24Zm6.6-3.8c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.9-4.43 9.9-9.89A9.86 9.86 0 0 0 12.06 2 9.88 9.88 0 0 0 2.18 11.88c0 2.22.65 3.88 1.74 5.62l-1 3.66 3.74-.96Zm11.39-5.27c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41Z" />
          </svg>
        </a>
      )}
      {tg && (
        <a
          href={tg}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message on Telegram"
          title="Message on Telegram"
          className="grid size-12 place-items-center rounded-full bg-[#229ED9] text-white shadow-lg transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
            <path d="M21.94 4.9 18.6 20.6c-.25 1.11-.92 1.38-1.86.86l-5.14-3.79-2.48 2.39c-.27.27-.5.5-1.03.5l.37-5.23 9.52-8.6c.41-.37-.09-.58-.64-.21L5.97 13.2.9 11.61c-1.1-.34-1.12-1.1.23-1.63L20.52 3.3c.92-.34 1.72.21 1.42 1.6Z" />
          </svg>
        </a>
      )}
    </div>
  );
}
