# Security Notes

## Implemented boundary

The Gemini credential is now server-side only. Browser code calls `/api/ai`; `api/ai.ts` reads `GEMINI_API_KEY` at runtime, validates the chat payload, and returns controlled errors. The Vite client build no longer receives a `VITE_GEMINI_API_KEY` value or a provider SDK import-map entry.

| Control | Implemented behavior | Limit |
|---|---|---|
| Credential isolation | `GEMINI_API_KEY` is read only in the server function | Relies on correct runtime configuration |
| Method restriction | Only `POST` is accepted | Not caller authentication |
| History validation | Roles, message text, count, and sizes are bounded | Does not moderate semantic content |
| Context bound | Recent messages only are sent through the normal client contract | Direct callers can still make allowed requests without accounts |
| Basic rate limit | In-memory per-IP request window | Not shared across serverless instances |
| Error translation | The UI receives stable service errors | No production alerting or log-retention policy is configured |

## Conversation data

The application keeps the visible conversation in browser memory only. A page reload clears it, and the repository does not implement server-side conversation persistence. If persistence is introduced later, define retention, user notice, access controls, and deletion behavior before collecting chat content.

## Environment configuration

Create `.env.local` from `.env.example` for local serverless development:

```dotenv
GEMINI_API_KEY=replace-with-your-development-key
```

Do not commit credentials or local environment files. Do not use `VITE_GEMINI_API_KEY`; Vite-prefixed environment variables are browser-visible.

## Deployment requirements

For a public deployment, configure `GEMINI_API_KEY` in the server runtime only and verify that `api/ai.ts` is executed server-side. The current in-memory limiter is intentionally lightweight. A publicly exposed multi-instance service should add shared rate limiting and an authentication or abuse-control design appropriate to the product.

## Reporting a security concern

Do not publish credentials or sensitive vulnerability details in a public issue. Use GitHub private vulnerability reporting when available, or contact the repository owner privately.

## Scope note

This document records source-level controls. It is not a penetration-test result, compliance certification, or claim of complete production security.
