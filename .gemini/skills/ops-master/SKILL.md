---
name: ops-master
description: Specialized guidance for FocusVault's CI/CD pipeline, local development, and operational troubleshooting. Use when managing builds, resolving deployment errors, or ensuring environment security.
---

# Ops & Tooling Expert

This skill provides expert guidance for FocusVault's operational tasks, ensuring consistency across environments and adherence to security standards.

## 🛠 Command Context
Always distinguish between development and production environments when suggesting commands:
- **Local Development**: Use `pnpm dev` for running the application locally.
- **Production Build**: Use `pnpm build` for generating production-ready bundles.

## 🔍 Validation Loop
**CRITICAL**: Before proposing or implementing any code changes, you MUST instruct Gemini to execute the following command to check for linting violations:
`npm run lint`

## 🛡 Environment Security (Red Line Rules)
To maintain project integrity and security, the following rules are non-negotiable:
- **NEVER** read, modify, or print the contents of `.env` files.
- **NEVER** hardcode secrets, API keys, or sensitive credentials in the source code.
- Always assume environment variables are the only source for sensitive configuration.

## 🚒 Error Recovery: Common Failure Modes

| Failure Mode | Symptoms | Resolution |
| :--- | :--- | :--- |
| **Docker Port Conflict** | Error: `port is already allocated` | Run `docker ps` to find conflicting containers; use `docker stop <id>` or change the port mapping in `docker-compose.yml`. |
| **Dependency Mismatch** | `Module not found` after branch switch | Run `pnpm install` to synchronize local `node_modules` with `package.json`. |
| **Supabase Sync Error** | Offline changes not appearing in DB | Check `SyncQueue` logs in dev console; ensure `EXPO_PUBLIC_SUPABASE_URL` is correct. |
| **Metro Bundler Crash** | `EADDRINUSE: address already in use :::8081` | Kill the process on port 8081 using `npx kill-port 8081` and restart the bundler. |

---
**Architectural Source of Truth**: @GEMINI.md
