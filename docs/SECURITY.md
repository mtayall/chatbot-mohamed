# Security Notes

## Current security boundary

This repository is a client-side prototype. It does not contain a backend service, user authentication, authorization policy, rate limiting, or a server-only secret store.

## `VITE_GEMINI_API_KEY` is browser-visible

Vite exposes variables prefixed with `VITE_` to browser code. Consequently, `VITE_GEMINI_API_KEY` must not hold a long-lived production secret in a public deployment.

- Never commit `.env`, `.env.local`, API keys, tokens, or private credentials.
- Use only a restricted key for local development and controlled experiments.
- Do not treat client-side environment configuration as a secret-management system.

## Before public deployment

Move provider calls behind a server-side API. The server should retain the provider credential, validate requests and returned data, apply rate limits, set explicit maximum input sizes, and use error handling appropriate to the deployment.

## Conversation data

The inspected code maintains the conversation only in browser memory. It does not establish a privacy policy, retention policy, or server-side data controls. If persistence is added, the data flow and user notice should be designed before collecting conversations.

## Reporting a security concern

Do not publish credentials or sensitive vulnerability details in a public issue. Use GitHub private vulnerability reporting when available, or contact the repository owner privately.

## Scope note

This document describes the verified application boundary. It is not a security audit certification or a claim of compliance with a specific security standard.
