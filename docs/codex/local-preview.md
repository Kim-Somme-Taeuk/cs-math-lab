# Local Preview

Use this document only when the user asks to open, preview, or view the app in a browser.

Do not spend time rediscovering the networking setup.

This CCC container uses Docker `NetworkMode=host`, but that host is not reliably the user's WSL/Windows localhost. A Next dev server started inside the active CCC container can answer `curl http://127.0.0.1:3001/` from inside the container while still failing for the user's browser at `http://localhost:3001/`.

Use a published preview container instead.

If the active CCC container name or project path changed, identify the current container/path first and substitute those values. Do not blindly use stale container IDs.

## Start preview container

```bash
docker rm -f cs-math-lab-preview >/dev/null 2>&1 || true
docker commit ccc-cs-math-lab-aaeda6f4a3e8 cs-math-lab-preview:latest >/dev/null
docker run -d \
  --name cs-math-lab-preview \
  --entrypoint bash \
  --volumes-from ccc-cs-math-lab-aaeda6f4a3e8 \
  -p 127.0.0.1:3001:3001 \
  -w /project/cs-math-lab-aaeda6f4a3e8 \
  cs-math-lab-preview:latest \
  -lc 'npm run dev -- --hostname 0.0.0.0 --port 3001'
```

## Verify preview

```bash
docker ps --filter name=cs-math-lab-preview --format '{{.ID}} {{.Names}} {{.Ports}}'
docker logs --tail 80 cs-math-lab-preview
curl -I --max-time 30 http://127.0.0.1:3001/
```

Expected Docker port mapping:

```text
127.0.0.1:3001->3001/tcp
```

Tell the user to open:

```text
http://localhost:3001/
```

## Fallback rule

Do not use the old `/tmp/port_proxy.py` workaround unless the user explicitly asks for an emergency tunnel. It is only a temporary workaround, not the normal preview path.
