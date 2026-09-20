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

Optionally checks configured DJAEGER endpoints.

Environment variables:

- `DJAEGER_AI_HEALTH_URL`
- `DJAEGER_WORK_HEALTH_URL`

If they are not configured, the target is reported as `NOT_CONFIGURED`.

## Initial architecture

```
ChatGPT
   |
GitHub
   |
Vercel Gateway (SHADOW)
   |-- /api/health
   '-- /api/status
```

Production control remains isolated until the shadow path is validated.
