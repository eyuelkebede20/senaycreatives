// Passenger / CloudLinux Node Selector startup shim.
//
// cPanel's Passenger (lsnode.js) require()s the configured startup file. Next.js
// standalone emits a CommonJS server.js that boots an HTTP server as soon as it's
// required, listening on process.env.PORT — which Passenger assigns. So we just
// require it, after fixing two env quirks:
//
//   * NODE_ENV must be production.
//   * Next standalone binds to process.env.HOSTNAME; on shared hosts the shell
//     often sets HOSTNAME to the machine name, which fails. Force 0.0.0.0.
//
// Set runtime config (DATABASE_URL, SMTP_*, NEXT_PUBLIC_SITE_URL, etc.) in the
// cPanel Node app's Environment Variables — they're read at boot.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.HOSTNAME = "0.0.0.0";

require("./server.js");
