# VPS / Nginx: SSE streams and API stability

Admin dashboards use Server-Sent Events (SSE):

- `/api/student-registrations/stream?token=...`
- `/api/agents/stream?token=...`
- `/api/content/stream`
- `/api/lms-content/stream`

## Nginx (required for SSE)

Inside the `location /api/` block (or per-stream locations):

```nginx
proxy_http_version 1.1;
proxy_set_header Connection '';
proxy_buffering off;
proxy_cache off;
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;
chunked_transfer_encoding off;
```

For each SSE path you can also set:

```nginx
add_header X-Accel-Buffering no;
```

## Environment

Set in `backend/.env` on the VPS:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` or `DATABASE_URL` | MongoDB connection |
| `JWT_SECRET` | Must match the value used when users logged in |
| `CLIENT_URL` | Public frontend URL (CORS) |
| `NODE_ENV=production` | Production mode |

After changing `JWT_SECRET`, all admins must log in again (old tokens become invalid).

## Health check

```bash
curl -s http://127.0.0.1:5000/api/health
```
