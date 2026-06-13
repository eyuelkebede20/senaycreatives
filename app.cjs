// Passenger / CloudLinux Node Selector startup shim.
//
// IMPORTANT: CloudLinux NodeJS Selector owns `node_modules` at the application
// root (senay/node_modules is a symlink to a virtualenv). So our self-contained
// Next.js standalone bundle — which ships its OWN real node_modules — lives in a
// subfolder, senay/app/, well clear of that symlink. This startup file sits at
// the app root and boots the bundled server.
//
// Next standalone emits a CommonJS server.js that starts an HTTP server on
// process.env.PORT (which Passenger assigns) the moment it's required. We just
// fix two env quirks first:
//   * NODE_ENV must be production.
//   * Next binds to process.env.HOSTNAME; shared hosts often set that to the
//     machine name, which fails — force 0.0.0.0.
//
// Set runtime config (DATABASE_URL, SMTP_*, NEXT_PUBLIC_SITE_URL, etc.) in the
// cPanel Node app's Environment Variables — they're read at boot.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.HOSTNAME = "0.0.0.0";

require("./app/server.js");
