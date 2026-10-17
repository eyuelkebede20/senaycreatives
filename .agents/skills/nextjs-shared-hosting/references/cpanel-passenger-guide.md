# cPanel & Passenger Deployment Manual & Troubleshooting

This reference guide provides deep operational details for hosting Next.js applications on shared cPanel environments powered by CloudLinux, LiteSpeed, or Apache Phusion Passenger.

---

## 1. Directory Structure on the Shared Host

On cPanel accounts, your home directory is typically `/home/<username>/`.
Many developers mistakenly try to point their Node.js application root to `/home/<username>/public_html`. **Do not do this.**

- **`public_html`** is the document root for PHP and Apache/LiteSpeed static files.
- The Node application should live in a parallel directory, e.g. `/home/<username>/api/<app_name>` or `/home/<username>/apps/<app_name>`.
- The domain or subdomain can still point to this Node app via cPanel's **Application URL** field in the Node.js selector interface.

### File Hierarchy on Server:
```text
/home/<username>/
├── api/
│   └── myapp/                     <-- cPanel Application Root
│       ├── app.cjs                <-- Application startup file
│       ├── node_modules/          <-- Symlink to CloudLinux virtualenv (NEVER touch)
│       ├── app/                   <-- Standalone bundle
│       │   ├── server.js
│       │   ├── package.json
│       │   ├── node_modules/      <-- Real production node_modules from Next.js standalone
│       │   ├── .next/
│       │   │   ├── server/
│       │   │   └── static/        <-- Static assets
│       │   └── public/            <-- Public assets
│       └── tmp/
│           └── restart.txt        <-- Touch to restart
├── uploads/                       <-- Persistent storage outside deploy folder
└── public_html/                   <-- Apache default webroot
```

---

## 2. cPanel Setup Step-by-Step

1. Navigate to **cPanel** $\rightarrow$ **Software** $\rightarrow$ **Setup Node.js App**.
2. Click **Create Application**.
3. Fill in:
   - **Node.js version**: 20.x or 22.x (ensure it matches your local Node engine requirement).
   - **Application mode**: `Production`.
   - **Application root**: `api/myapp` (or your chosen subfolder).
   - **Application URL**: `yourdomain.com` or `subdomain.yourdomain.com`.
   - **Application startup file**: `app.cjs`.
4. Click **Create**.
5. Once created, CloudLinux generates a virtualenv and places a symlink named `node_modules` in `~/api/myapp/`.
   > **CRITICAL**: Do NOT click "Run NPM Install". The standalone bundle has all required dependencies pre-packaged inside `app/node_modules/`.
6. Add Environment Variables in the cPanel interface:
   - `NEXT_PUBLIC_SITE_URL`: `https://yourdomain.com`
   - `DATABASE_URL`: `postgresql://user:pass@host:5432/dbname`
   - `UPLOAD_DIR`: `/home/<username>/uploads`

---

## 3. Common Errors & How to Fix Them

### Issue 1: `503 Service Unavailable` or Passenger Crash on Boot
- **Symptom**: Opening the site returns a 503 error or Phusion Passenger error screen.
- **Cause**: Next.js attempted to bind to `process.env.HOSTNAME` (which shared hosts often set to the machine host, e.g. `cpanel34.sharedhost.net`), or `PORT` binding collided.
- **Fix**: Ensure `app.cjs` explicitly sets:
  ```javascript
  process.env.NODE_ENV = "production";
  process.env.HOSTNAME = "0.0.0.0";
  require("./app/server.js");
  ```

### Issue 2: CSS / JS Bundles Return 404 (Broken Styling)
- **Symptom**: HTML loads but pages are unstyled, and console shows 404 for `/_next/static/*`.
- **Cause**: Next.js `output: "standalone"` deliberately does not copy `.next/static` or `public` into the standalone folder during build.
- **Fix**: Your deployment process must copy:
  - `.next/static/` $\rightarrow$ `deploy/app/.next/static/`
  - `public/` $\rightarrow$ `deploy/app/public/`

### Issue 3: `EACCES` or Broken Symlink on `node_modules`
- **Symptom**: FTP fails or CloudLinux node selector breaks saying `node_modules` is corrupted.
- **Cause**: An FTP upload overwrote `~/api/myapp/node_modules` with a real folder, destroying the symlink to the CloudLinux virtualenv.
- **Fix**: Keep the Next.js bundle inside `app/` so the real `node_modules` is located at `~/api/myapp/app/node_modules/`. Never upload to the application root directly without subfolder nesting.

### Issue 4: Database Migrations Fail During Deploy
- **Symptom**: Deployment hangs, times out, or fails because migration runner tries to execute on the shared host without terminal access.
- **Fix**: Decouple database migrations from the file upload workflow. Run migrations from your local development machine or CI step targeting the production database credentials via `pnpm db:migrate`.

### Issue 5: Uploaded User Files Disappear After Redeployment
- **Symptom**: User avatars or uploaded files vanish on subsequent Git pushes.
- **Cause**: Files were saved inside the application root or `public/` folder, which gets replaced during deployment.
- **Fix**: Configure `UPLOAD_DIR` pointing to `/home/<username>/uploads` (a directory outside the deployment directory), and serve media files through a Next.js API route or dedicated static handler.

### Issue 6: Changes Not Reflecting After Deployment
- **Symptom**: Upload completes but browser still serves the old version.
- **Cause**: Passenger worker processes keep running in memory.
- **Fix**:
  1. The deploy script touches `deploy/tmp/restart.txt`.
  2. If LiteSpeed doesn't auto-reload on `restart.txt`, log into cPanel $\rightarrow$ **Setup Node.js App** $\rightarrow$ click **Restart**.
