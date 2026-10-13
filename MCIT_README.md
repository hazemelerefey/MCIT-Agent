# MCIT AI (LobeHub core)

Private AI agent app for the Ministry of Communications and Information Technology (MCIT).
Built on [LobeHub](https://github.com/lobehub/lobehub) with light MCIT branding, larger agent
avatars, a local Egyptian-pharaoh avatar gallery (default **Tutankhamun**), and privacy-first
defaults.

**Agent name:** Thoth  
**Credit:** Developed by Eng Ahmed Arfa for MCIT

## Why this tree

The previous Open Notebook fork kept notebooks/Studio but its agent chat UI and runtime were too
weak. This directory is the **LobeHub application** (agents, agent UI, tools, gateway) with MCIT
identity applied on top. Notebook/Studio features from the prior stack can be ported later as
LobeHub tools/pages.

## License warning (required reading)

Upstream `LICENSE` is the **LobeHub Community License** (Apache-2.0 + extra terms). Developing and
distributing a **derivative** (branding + code changes) for commercial/organizational use requires a
**commercial license from LobeHub LLC** (`hello@lobehub.com`). Self-hosting the unmodified image is
allowed commercially; this fork is a derivative. Obtain rights before production rollout.

## What we changed (slight edits)

| Area | Change |
|------|--------|
| Branding | `packages/business/const/src/branding.ts` → **MCIT AI** / **MCIT** |
| Default agent | Inbox title **Thoth**, avatar `/avatars/tutankhamun.webp` |
| Avatar gallery | `public/avatars/mcit/*.webp` + profile picker tab (local only, no GitHub fetch) |
| Chat avatars | Message avatar default **40px** (was 28) |
| Home hero | Agent welcome avatar **96px** (was 64) |
| Sidebar list | Agent/inbox avatars **36px** (was 22–24) |
| Header | Conversation header avatar **32px** (was 24) |
| Profile | Artwork avatar control **96px** (was 72) |
| Telemetry | `DEFAULT_COMMON_SETTINGS.telemetry = false` |
| Privacy deploy | `docker-compose/mcit/` with `TELEMETRY_DISABLED=1`, Ollama hook, no PostHog/Sentry keys |

## Privacy posture (official / sensitive data)

- Prefer **local Ollama** only; do not paste cloud API keys into Settings unless approved.
- Do **not** set `POSTHOG_KEY`, Sentry DSN, or Langfuse keys on production hosts.
- Keep `TELEMETRY_DISABLED=1`.
- App still needs Postgres + Redis + S3-compatible storage (RustFS in compose) — all local volumes.
- File uploads and chats live in those local services; treat disk encryption and access control as
  part of the security boundary.
- “100% private” is an **ops claim**: air-gap or egress firewall the host; do not enable cloud
  providers or community marketplaces that call the public internet.

## Run (private Docker)

```bash
cd docker-compose/mcit
cp .env.example .env
# fill KEY_VAULTS_SECRET, AUTH_SECRET, passwords, JWKS (or run ../setup.sh once and copy secrets)
docker compose up -d
# UI: http://localhost:3210
```

Stock image (`lobehub/lobehub`) runs the full agent stack; MCIT avatars are bind-mounted. Full
MCIT name/branding requires building this tree:

```bash
pnpm install
bun run build:docker
# then set MCIT_IMAGE=your-registry/mcit-ai:tag in .env
```

Dev (from repo root, after install):

```bash
bun run dev
```

See upstream `AGENTS.md` for monorepo scripts. Node/pnpm/bun versions match upstream.

## Avatars source

Vendored from `hazemelerefey/mcit-ai-library`  
`alloy-ai-kit/design-references/avatars/webp/` (no runtime network).

## Roadmap (MCIT features on Lobe core)

1. Build and ship custom `mcit-ai` image with branding baked in  
2. Port **Notebook** / **Studio** (multi-format export, Kokoro TTS) as Lobe tools or routes  
3. Harden air-gapped install (offline model pull, disabled marketplaces)  
4. E2E tests for upload + agent chat + avatar gallery  
5. Commercial license confirmation on file

## Related

- Upstream: https://github.com/lobehub/lobehub  
- Prior Open Notebook work remains in the parent monorepo for feature reference only  
