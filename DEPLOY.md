# Deploying SenayCreatives

This is a **Next.js** app built with `output: "standalone"` and deployed to a
**cPanel Passenger (CloudLinux Node Selector)** account over **FTP** via GitHub
Actions (`.github/workflows/deploy.yml`).

> Why standalone: it bundles the server and only the `node_modules` it actually
> needs, so the upload is small and no `npm install` runs on the host.

## One-time setup

### 1. Create the Node app in cPanel

cPanel → **Setup Node.js App** → Create Application:

| Setting | Value |
| --- | --- |
| Node.js version | **22.x** |
| Application mode | Production |
| Application root | `api/senaypageapi` *(a folder beside `public_html` — cPanel won't run a Node app from the domain docroot; must match `FTP_SERVER_DIR`, default `./api/senaypageapi/`)* |
| Application URL | your domain |
| **Application startup file** | **`app.cjs`** |

Do **not** click **Run NPM Install** — the deploy ships its own `node_modules`.

### 2. Set environment variables (in the same cPanel screen)

```
NEXT_PUBLIC_SITE_URL = https://senaycreatives.com
DATABASE_URL         = postgres://…
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NOTIFY_TO
UPLOAD_DIR           = /home/<user>/uploads      # OUTSIDE public_html
```

These are read at boot (and at request time) by the app. See `.env.example`.

### 3. Add GitHub secrets

Repo → **Settings → Environments → New environment → `SenayCreatives`**, then add:

| Secret | Required | Notes |
| --- | --- | --- |
| `FTP_SERVER` | ✅ | host, e.g. `ftp.senaycreatives.com` |
| `FTP_USERNAME` | ✅ | cPanel/FTP user |
| `FTP_PASSWORD` | ✅ | |
| `FTP_PORT` | optional | default `21` |
| `FTP_PROTOCOL` | optional | `ftps` if the host supports TLS (recommended) |
| `FTP_SERVER_DIR` | optional | default `./public_html/`; set if your FTP account already lands inside `public_html` (then use `./`) |

Optional repo **variable** `SITE_URL` overrides the canonical origin at build.

## Deploying

- **Automatic:** push to `main`.
- **Manual:** Actions tab → *Deploy senaycreatives.com* → *Run workflow*.

The workflow builds, assembles `deploy/` (server.js + node_modules + `.next/static`
+ `public` + `app.cjs` + `tmp/restart.txt`), and FTPs it to the app root. Writing
a new `tmp/restart.txt` each run nudges Passenger to restart and serve the build.

## Database migrations

Migrations are **not** run by the deploy. After a schema change, run once against
the production database (locally with the prod `DATABASE_URL`, or via the host's
terminal):

```bash
pnpm db:migrate
```

## On-disk layout in `api/senaypageapi/` (why the `app/` subfolder)

CloudLinux NodeJS Selector **owns `node_modules` at the application root** — the
app root's `node_modules` is a symlink to a virtualenv, and the root must not
contain a real folder named `node_modules`. Our standalone bundle ships its own
real `node_modules`, so we keep the whole bundle in a **subfolder** clear of that
symlink:

```
api/senaypageapi/        ← Application Root (CloudLinux manages its node_modules)
├── app.cjs              ← Application startup file (boots app/server.js)
├── node_modules         ← CloudLinux's symlink → virtualenv (untouched by us)
├── app/                 ← our self-contained bundle
│   ├── server.js
│   ├── node_modules/    ← the REAL deps the app uses (no conflict — different path)
│   ├── .next/ (incl. static)
│   └── public/
└── tmp/restart.txt      ← touch to restart
```

So `app.cjs` does `require("./app/server.js")` and the app resolves its deps from
`app/node_modules` — the CloudLinux symlink at the app root is never used or
overwritten.

## Caveats / things to verify on first deploy

- **Create the app first.** In cPanel, create the Node app with Application Root
  `api/senaypageapi` so CloudLinux sets up the root `node_modules` symlink, then
  deploy into it. (If an earlier deploy left files in another folder like `senay/`,
  you can delete that folder — it's unused now.)
- **`HOSTNAME`.** `app.cjs` forces `0.0.0.0`; if the host assigns a Unix socket
  via `PORT` instead of a numeric port, ask the host or switch to a numeric port.
- **Restart.** The deploy rewrites `tmp/restart.txt`, but LiteSpeed's Node manager
  may not auto-restart on it — click **Restart** in cPanel if a deploy doesn't take.
- **First deploy is full** (~20+ min over FTP); subsequent deploys are delta.
- **Terminal fallback.** This host provides SSH/terminal — if FTP is fiddly, you
  can `git pull` + `pnpm build` + copy the bundle into `api/senaypageapi/app/` + restart.

After a deploy, sanity-check: `/`, `/packages`, `/projects/achc`, `/sitemap.xml`,
`/robots.txt`, and `/opengraph-image`.
