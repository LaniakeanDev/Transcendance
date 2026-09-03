This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deployment (Docker / Podman)

The whole app runs in containers. The database is **not** containerized: it stays
remote on Supabase. Two services are started:

| Service | Role                                                                                      |
| ------- | ----------------------------------------------------------------------------------------- |
| `app`   | Next.js production server (standalone build), internal port 3000, not exposed to the host |
| `proxy` | Nginx, terminates **HTTPS** with a self-signed certificate and forwards to `app`          |

Every browser ↔ backend request goes over HTTPS; the `proxy` ↔ `app` hop stays on
the private container network.

### Prerequisites

- Docker + `docker compose`, **or** Podman + `podman-compose`
- A `.env` file at the repo root (copy `.env.example` and fill it in). At minimum:
  - `DATABASE_URL` – Supabase pooled connection (pgBouncer, port 6543)
  - `DIRECT_URL` – Supabase direct connection (port 5432), used for migrations
  - `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`
  - `CLOUDINARY_*`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `OAUTH_REDIRECT_BASE=https://localhost:3000`
  - `HTTPS_PORT=3000` – host port for the proxy (must match `OAUTH_REDIRECT_BASE`)

### Run

```bash
make up          # build the images and start the stack (single command)
```

Then open **https://localhost:3000** (accept the self-signed certificate warning).

Other targets:

```bash
make logs        # follow container logs
make down        # stop the stack (keeps the generated certificate)
make re          # rebuild from scratch
make clean       # remove containers, volumes and local images
make migrate     # apply Prisma migrations to the remote Supabase DB (opt-in)
```

`make migrate` runs `prisma migrate deploy` in a throwaway container
(`compose.tools.yaml`). It is idempotent and only needed when pointing at a fresh
Supabase instance — the running stack never touches the schema.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
