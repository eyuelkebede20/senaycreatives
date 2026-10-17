---
name: nextjs-shared-hosting
description: >-
  Provides end-to-end guidance, configuration templates, bundle assembly scripts,
  and deployment workflows for hosting Next.js applications on shared hosting environments
  (cPanel, CloudLinux NodeJS Selector, LiteSpeed, Phusion Passenger) via standalone builds and FTP/SFTP.
---

# Deploying Next.js on Shared Hosting (cPanel / CloudLinux / Passenger)

Deploying a modern Next.js application to shared cPanel hosting is challenging because shared hosts enforce strict CPU/RAM limits, lack native build tools, and use CloudLinux NodeJS Selector which owns a symlink named `node_modules` at the application root.

This skill provides the proven architecture used in production to run Next.js (App Router / Pages Router) reliably on shared hosting with zero-install deployments and automatic process reloading.

---

## Architecture Overview

```
Application Root (e.g., ~/api/myapp/)
├── app.cjs              # Passenger startup shim (launches ./app/server.js)
├── node_modules/        # CloudLinux managed symlink → virtualenv (UNTOUCHED)
├── app/                 # Self-contained Next.js standalone bundle
│   ├── server.js        # Next.js standalone HTTP server
│   ├── package.json
│   ├── node_modules/    # Real production dependencies traced by Next.js
│   ├── .next/
│   │   ├── server/
│   │   └── static/      # Copied static assets (chunks, styles, media)
│   └── public/          # Copied public assets (icons, images)
└── tmp/
    └── restart.txt      # Touch/rewrite this file to trigger Passenger reload
```

### Why this architecture works:
1. **No `npm install` on the host**: Next.js `output: "standalone"` traces every required file and package into a self-contained bundle. The host does not need build tools, compiler libraries, or high memory.
2. **Subfolder Isolation (`app/`)**: CloudLinux NodeJS Selector creates a virtualenv symlink named `node_modules` in the application root. By nesting our app bundle inside `app/`, our real production `node_modules` never collides with or breaks CloudLinux's symlink.
3. **`app.cjs` Startup Shim**: Overrides `HOSTNAME` to `0.0.0.0` (avoiding host machine name binding failures) and loads `app/server.js` while allowing Passenger to assign `PORT`.
4. **Persistent Storage Outside Deploy Directory**: User uploads and media are stored in a dedicated folder outside the deploy root (e.g. `~/uploads`) so automated delta deployments never overwrite user data.

---

## Step-by-Step Implementation Guide

### 1. Configure Next.js (`next.config.ts` or `next.config.js`)
Ensure `output: "standalone"` is enabled and image optimization is configured to avoid requiring native binary dependencies like `sharp` on the shared server.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required: produces a minimal standalone bundle in .next/standalone
  output: "standalone",

  // Recommended: disable sharp runtime requirement on shared host
  images: {
    unoptimized: true,
  },

  // Security headers recommended for shared hosting
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

See template: [next.config.template.ts](./resources/next.config.template.ts)

---

### 2. Add the Passenger Startup Shim (`app.cjs`)
Create `app.cjs` in the project root:

```javascript
// Passenger / CloudLinux Node Selector startup shim
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.HOSTNAME = "0.0.0.0"; // Fixes EADDRNOTAVAIL on shared hosts

require("./app/server.js");
```

See reference file: [app.cjs](./resources/app.cjs)

---

### 3. Build & Assemble Deployment Payload
Next.js `output: "standalone"` creates `.next/standalone`, but does **not** copy `.next/static` or `public`. The payload must be assembled before uploading:

Run the cross-platform assembler script:
```bash
node .agents/skills/nextjs-shared-hosting/scripts/assemble-deploy.mjs
```
*(Or use the bash commands in CI/CD pipeline, see [deploy-workflow.yml](./resources/deploy-workflow.yml))*

Assembly steps performed:
1. Clean/create staging directory `deploy/app/`
2. Copy `.next/standalone/.` $\rightarrow$ `deploy/app/`
3. Copy `.next/static/.` $\rightarrow$ `deploy/app/.next/static/`
4. Copy `public/.` $\rightarrow$ `deploy/app/public/` (if exists)
5. Copy `app.cjs` $\rightarrow$ `deploy/app.cjs`
6. Write timestamp/hash $\rightarrow$ `deploy/tmp/restart.txt`

---

### 4. cPanel One-Time Setup
1. Log into **cPanel** $\rightarrow$ **Setup Node.js App** (or **NodeJS Selector**).
2. Click **Create Application**:
   - **Node.js version**: Select `20.x` or `22.x` (matching build environment).
   - **Application mode**: `Production`.
   - **Application root**: e.g., `api/myapp` (create a dedicated folder beside `public_html`).
   - **Application URL**: Your domain or subdomain.
   - **Application startup file**: `app.cjs` (NOT `server.js`).
3. **DO NOT click "Run NPM Install"** in cPanel.
4. Set Environment Variables in cPanel:
   - `NEXT_PUBLIC_SITE_URL`: `https://yourdomain.com`
   - `DATABASE_URL`: `postgres://...` (or separate `PGHOST`, `PGUSER`, `PGPASSWORD`, etc.)
   - `UPLOAD_DIR`: `/home/<username>/uploads` (outside the deploy directory)
   - `PORT`: (Managed by Passenger automatically)

---

### 5. Deployment Options

#### Option A: Automated GitHub Actions via FTP/FTPS (Recommended)
Set up `.github/workflows/deploy.yml` with secrets:
- `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_PORT` (21), `FTP_PROTOCOL` (`ftps` or `ftp`)
- `FTP_SERVER_DIR`: `./api/myapp/` (or relative path to application root)

See full workflow: [deploy-workflow.yml](./resources/deploy-workflow.yml)

#### Option B: Manual / SSH / Zip Upload
1. Run `pnpm build`
2. Run `node .agents/skills/nextjs-shared-hosting/scripts/assemble-deploy.mjs`
3. Upload contents of `deploy/` into `~/api/myapp/` via FTP or cPanel File Manager.
4. Touch or edit `tmp/restart.txt` to trigger restart.

---

## Detailed Manuals & Troubleshooting
For in-depth troubleshooting of common shared hosting errors (`503 Service Unavailable`, `EADDRNOTAVAIL`, missing CSS/JS 404s, LiteSpeed caching), refer to:
- [cPanel & Passenger Troubleshooting Guide](./references/cpanel-passenger-guide.md)
