// Passenger / CloudLinux Node Selector startup shim.
//
// IMPORTANT: CloudLinux NodeJS Selector owns `node_modules` at the application
// root (e.g. ~/api/myapp/node_modules is a symlink to a virtualenv).
// To prevent collisions, the Next.js standalone bundle lives in a subfolder `app/`.
// This startup shim sits at the application root and boots the bundled server.
//
// Standalone Next.js emits a CommonJS server.js that starts an HTTP server on
// process.env.PORT (which Passenger dynamically assigns).
//
// Environment overrides:
//   * NODE_ENV is forced to 'production'.
//   * HOSTNAME is forced to '0.0.0.0' to prevent binding to machine hostnames.

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.HOSTNAME = "0.0.0.0";

require("./app/server.js");
