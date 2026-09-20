# DJAEGER Vercel Gateway

Independent shadow gateway for DJAEGER.

## Safety boundary

This repository is intentionally separate from DJAEGER production services.

- Does not modify Railway.
- Does not modify DJAEGER Control Center.
- Does not send commands to devices.
- Does not consume Hermes neurons.
- Starts in `SHADOW` mode.

## Endpoints

### `GET /api/health`

Returns gateway health and deployment metadata.

### `GET /api/status`

Checks DJAEGER AI and DJAEGER Work health endpoints.

### `GET /api/route`

Returns the current shadow routing decision. Device commands remain disabled.

### `GET /api/control`

Describes the prepared self-hosted control path. It is not an activation endpoint.

## Safety verification

GitHub Actions runs Node's built-in test runner against the gateway routing and durable desired-state contract. The tests require:

- Railway online => `HERMES_RAILWAY`.
- Railway offline => `VERCEL_SAFE_FALLBACK`.
- `commands_allowed=false` in all shadow cases.
- self-hosted worker remains `PREPARED_DISABLED`.
- durable desired state remains `SHADOW / OBSERVE / allow_device_writes=false`.

## Architecture

```
ChatGPT
   |
GitHub durable control
   |
Vercel Gateway (SHADOW)
   |-- Railway DJAEGER AI health
   |-- DJAEGER Work relay health
   '-- Self-hosted path (prepared, disabled)
```

Production control remains isolated until an explicit cutover.
