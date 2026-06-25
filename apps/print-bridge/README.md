# @sferadev/print-bridge

A tiny always-on network service that prints composited photobooth strips to an
AirPrint/IPP photo printer (built and tested against the **Canon SELPHY
CP-1500** over WiFi) **silently**, with no print dialog.

It is a **[Bun](https://bun.sh) app** and ships as a **single-file, cross-compiled
executable** (no runtime install required on the target machine).

The photocall kiosk talks to this bridge over HTTP. The bridge:

- discovers AirPrint/IPP printers on the LAN over **mDNS/Bonjour**,
- advertises **itself** over mDNS (`_photocall-bridge._tcp`) so operators can
  find it without typing an IP,
- supports a **manual-printer fallback** (env + REST) for networks where mDNS is
  blocked or unavailable,
- accepts print jobs over a small REST API,
- prints them directly via **IPP** (no CUPS / OS print queue required),
- retries failed jobs with exponential backoff, one job at a time (dye-sub
  printers can't interleave jobs).

> **It must run on a device on the same WiFi/LAN as the printer** (the SELPHY).
> IPP and mDNS are link-local; a bridge on a different network/VLAN cannot reach
> the printer.

## ⚠️ Mixed content (production HTTPS kiosk → HTTP bridge)

The bridge speaks plain **HTTP** by default (`http://…:3200`). Browsers **block**
a page served over **HTTPS** from fetching an insecure **HTTP** origin
("mixed content"). So a kiosk hosted at `https://photocall.example.com` **cannot**
talk to `http://photocall-bridge.local:3200` — the browser refuses the request
before it leaves the page, and **this cannot be fixed in JavaScript** (it is a
hard browser security policy, not a CORS/config issue).

For a **production** kiosk on HTTPS you must do **one** of:

1. **Reach the bridge over a browser-trusted TLS transport.** Put a reverse proxy
   (Caddy/nginx) in front of the bridge with a certificate the kiosk device
   trusts, and point the bridge URL at the `https://` address. (A self-signed cert
   only works if it's installed/trusted on the kiosk device.)
2. **Serve the kiosk itself over plain HTTP on the LAN**, so the page and the
   bridge are both HTTP and the browser allows the request. Acceptable on a
   closed booth network; not recommended on the public internet.

**Local development is unaffected:** everything runs over HTTP
(`http://localhost`), so the kiosk reaches the bridge directly. Use the
**[Debug (file output) printer](#debug-file-output-printer)** to exercise the
**entire** submit → queue → "print" flow over HTTP locally without a real printer
or any dye-sub media.

> **Or skip mixed content entirely with [cloud-pull mode](#cloud-pull-mode-outbound-polling).**
> Instead of the kiosk reaching the bridge over the LAN, the bridge polls the
> photocall server **outbound** for jobs. No inbound connectivity, no HTTPS→HTTP
> request, no reverse proxy — the bridge only makes outgoing HTTPS calls.

## Why a separate service?

Browsers can only print through the OS print dialog (`window.print()`). To print
**automatically** and **silently** we need to speak IPP from a process on the
network — that's this bridge. The kiosk's "AirPrint manual" mode still uses
`window.print()` for iPads with no bridge; the bridge is the "Auto bridge" mode.

## Requirements

- [Bun](https://bun.sh) **1.3+** (for development and to build the binaries).
- The **binary** has **no runtime dependency** — Bun is embedded in it.

## Quick start (development)

```bash
pnpm install
cd apps/print-bridge
bun run dev          # bun --watch src/server.ts (auto-reload)
# or, without watch:
bun run start        # bun src/server.ts
```

On startup it logs the listen URL and begins discovering printers. Point the
photocall admin **Print** page → bridge URL at `http://<bridge-host>:3200`.

## Building the standalone binaries

`build:bin` cross-compiles single-file executables for every target with
`bun build --compile`:

```bash
cd apps/print-bridge
bun run build:bin                     # all targets
bun run build:bin bun-darwin-arm64    # one (or several) targets
```

Output (in `dist/`):

| Target              | Binary                                  |
| ------------------- | --------------------------------------- |
| `bun-darwin-arm64`  | `dist/print-bridge-bun-darwin-arm64`    |
| `bun-darwin-x64`    | `dist/print-bridge-bun-darwin-x64`      |
| `bun-linux-x64`     | `dist/print-bridge-bun-linux-x64`       |
| `bun-linux-arm64`   | `dist/print-bridge-bun-linux-arm64`     |
| `bun-windows-x64`   | `dist/print-bridge-bun-windows-x64.exe` |

> Cross-compilation downloads the target's Bun runtime on first build, so the
> non-host targets need network access.

### Running a binary

```bash
PORT=3200 ./dist/print-bridge-bun-darwin-arm64
```

#### macOS Gatekeeper note (unsigned binaries)

These binaries are **not code-signed/notarized**. macOS will quarantine an
executable downloaded from the internet and refuse to run it ("cannot be opened
because the developer cannot be verified"). Clear the quarantine flag once:

```bash
xattr -dr com.apple.quarantine ./print-bridge-bun-darwin-arm64
```

…or **right-click → Open** in Finder the first time and confirm. (A binary you
just built locally is **not** quarantined; this only affects downloaded ones.)

## Printer discovery & the manual-printer fallback

### mDNS (automatic)

By default the bridge discovers `_ipp._tcp` / `_ipps._tcp` printers over mDNS and
advertises itself as `_photocall-bridge._tcp`.

> **Does mDNS work under Bun?** **Yes — verified on this machine (macOS,
> Bun 1.3.11).** `bonjour-service` (which uses `node:dgram` multicast under Bun's
> Node-compat layer) successfully discovered a real AirPrint printer on the LAN
> _and_ advertised the bridge (`dns-sd -B _photocall-bridge._tcp` lists it).
> Because `node:dgram` multicast can still be flaky on some networks/OSes under
> Bun, the bridge wraps mDNS in a guard (a failure there never takes down the
> HTTP server) and always offers the manual fallback below.

### Manual printers (fallback — always available)

If discovery does not work on your network, add printers explicitly. The bridge
fetches their IPP attributes and treats them exactly like discovered printers.

**1) At startup, via env** — `BRIDGE_PRINTER_URIS` (comma-separated). A full
IPP(S) URI or a bare host/IP (defaults to `ipp://<host>:631/ipp/print`):

```bash
BRIDGE_PRINTER_URIS="ipp://192.168.1.50:631/ipp/print,192.168.1.51" \
  ./print-bridge-bun-darwin-arm64
```

Seeding is non-blocking: an unreachable seed URI never stalls startup; the
printer is registered immediately and its live state is fetched in the
background.

**2) At runtime, via REST** — `POST /api/printers`:

```bash
curl -X POST http://localhost:3200/api/printers \
  -H 'Content-Type: application/json' \
  -d '{"uri":"ipp://192.168.1.50:631/ipp/print","name":"SELPHY"}'
```

Returns `201` with the registered printer (live attributes already fetched), or
`400` if the URI is invalid / unreachable.

## Environment variables

| Variable                 | Default | Description                                                                                  |
| ------------------------ | ------- | -------------------------------------------------------------------------------------------- |
| `PORT`                   | `3200`  | HTTP port for the REST API + QR endpoint.                                                     |
| `BRIDGE_ALLOWED_ORIGINS` | `*`     | Comma-separated CORS allowlist, or `*` to reflect any origin.                                 |
| `BRIDGE_USE_TLS`         | `false` | Build `ipps://` URIs (TLS) instead of `ipp://`.                                               |
| `BRIDGE_IPP_VERSION`     | `2.0`   | IPP version to negotiate first (auto-falls back to `1.1`).                                    |
| `BRIDGE_API_KEY`         | —       | Optional shared secret; required on `/api/*` as Bearer or `x-api-key`.                        |
| `BRIDGE_PRINTER_URIS`    | —       | Comma-separated IPP(S) URIs / hosts to seed as manual printers at startup (mDNS fallback).    |
| `BRIDGE_DEBUG_PRINTER_DIR` | —     | When set to a folder, publishes a virtual **Debug (file output)** printer that writes each job's JPEG into that folder instead of printing — test the full flow without consuming media. |
| `BRIDGE_CLOUD_URL`       | —       | Base URL of the photocall server's bridge-facing API. Set together with `BRIDGE_PAIRING_TOKEN` to enable [cloud-pull mode](#cloud-pull-mode-outbound-polling). Unset = LAN-only (today's behaviour). |
| `BRIDGE_PAIRING_TOKEN`   | —       | Per-event pairing token sent as `Authorization: Bearer <token>` on every cloud-pull request. Required to enable cloud-pull mode.                  |
| `BRIDGE_POLL_INTERVAL_MS` | `3000` | Cloud-pull only: how often to poll the cloud for new print jobs.                                                                                  |
| `BRIDGE_HEARTBEAT_INTERVAL_MS` | `30000` | Cloud-pull only: how often to report tracked-job status + printer inventory. The `printing` reports double as the claim heartbeat — keep well under the server's 5-minute stale window. |

### Debug (file output) printer

Set `BRIDGE_DEBUG_PRINTER_DIR` to test the end-to-end print flow without a real
printer or any dye-sub media:

```sh
BRIDGE_DEBUG_PRINTER_DIR=./debug-prints bun src/server.ts
```

A printer named **"Debug (file output)"** (id `debug`) then shows up in
`GET /api/printers`, so the photocall kiosk discovers and selects it like any
other. Each submitted job is written to the folder as
`photocall-<timestamp>-<id>.jpg` (one file per job; the folder is created on
first use). Leave it unset in production.

## Cloud-pull mode (outbound polling)

By default the kiosk reaches the bridge over the LAN (`POST /api/jobs`), which on
an HTTPS kiosk runs into [mixed content](#️-mixed-content-production-https-kiosk--http-bridge).
**Cloud-pull mode** flips the direction: the bridge **polls the photocall server
outbound** for print jobs and prints them through the same local queue. The
server never connects _in_ to the bridge, so there's nothing to expose, no
reverse proxy, and no HTTPS→HTTP request — the bridge only makes outgoing HTTPS
calls.

Enable it by setting **both** `BRIDGE_CLOUD_URL` and `BRIDGE_PAIRING_TOKEN`
(a per-event token paired from the photocall dashboard):

```bash
BRIDGE_CLOUD_URL="https://photocall.example.com" \
BRIDGE_PAIRING_TOKEN="<per-event pairing token>" \
  ./print-bridge-bun-linux-arm64
```

This runs **alongside** the LAN REST API — both work at once; leave the env unset
to run LAN-only exactly as before. While enabled, the bridge:

- **claims** jobs every `BRIDGE_POLL_INTERVAL_MS` (`POST /api/bridge/jobs/claim`),
  downloads each job's image from its presigned URL, and enqueues it into the
  existing no-loss print queue;
- **reports status** every `BRIDGE_HEARTBEAT_INTERVAL_MS`
  (`POST /api/bridge/jobs/:id/status`): a local job that is still pending or
  printing (including while the queue rides out an out-of-paper outage) reports
  `printing`, which **doubles as a heartbeat** keeping the server's claim alive;
  `done`/`failed` are reported once and then the job is dropped from tracking. The
  server re-queues a job to another bridge if it hears **no heartbeat for >5
  minutes**, so the heartbeat interval is kept well under that;
- **registers its printers** every heartbeat (`POST /api/bridge/printers`) so the
  dashboard can list them without any direct access to the bridge.

A fresh, ephemeral `bridgeId` is generated per process — after a restart the
server's stale-claim window lets the bridge re-claim any jobs that were stranded.
Every cloud call is bounded by a timeout and never throws: a failed poll or
report just logs and is retried on the next tick. If the server reports a `409`
on a status post (the job was re-queued/reassigned), the bridge simply stops
tracking that job.

## REST API

| Method   | Path                       | Description                                               |
| -------- | -------------------------- | -------------------------------------------------------- |
| `GET`    | `/health`                  | `{status, uptime, jobsPending, jobsFailed, printerCount}` |
| `GET`    | `/api/status`              | Bridge + printer snapshot (no live refresh).             |
| `GET`    | `/api/printers`            | Discovered + manual printers (refreshes live state).     |
| `POST`   | `/api/printers`            | **Add a printer by URI/IP** (manual fallback).           |
| `GET`    | `/api/printers/:id/status` | Live state for one printer (`:id` URL-encoded).          |
| `POST`   | `/api/printers/discover`   | Re-query mDNS for printers.                              |
| `POST`   | `/api/jobs`                | Submit a print job (see below).                          |
| `GET`    | `/api/jobs`                | Last 50 jobs.                                            |
| `GET`    | `/api/jobs/:id`            | One job's status.                                        |
| `DELETE` | `/api/jobs/:id`            | Cancel a still-pending job.                              |
| `GET`    | `/qr`                      | PNG QR code of the bridge's own URL (operator pairing).  |

`POST /api/printers` body:

```json
{ "uri": "ipp://192.168.1.50:631/ipp/print", "name": "SELPHY (optional)" }
```

`POST /api/jobs` body:

```json
{
  "printerId": "Canon SELPHY CP-1500:631/ipp/print",
  "imageBase64": "<JPEG bytes, base64, no data: prefix>",
  "paperSize": "selphy_postcard",
  "borderless": true,
  "copies": 1,
  "orientation": "portrait",
  "mediaType": "photographic-glossy"
}
```

## SELPHY CP-1500 reliability notes

The SELPHY is a great little dye-sub printer but has a few IPP quirks that the
bridge works around automatically:

1. **It sleeps.** Before every job the bridge sends a `Get-Printer-Attributes`
   "wake ping" so the printer is awake and ready.
2. **`media-col` can be rejected.** Borderless prints use a `media-col` with
   zero margins. If the printer answers `client-error-bad-request`, the bridge
   retries once with a plain `media` keyword (prints with a small border but
   succeeds) and notes it on the job.
3. **IPP version.** If IPP 2.0 attributes are rejected, the bridge falls back to
   IPP 1.1.
4. **Out of paper.** Detected via `printer-state = stopped` together with a
   `media-empty` / `media-needed` state reason; the job fails fast with a clear
   message instead of hanging.
5. **Unreachable printers fail fast.** Every IPP request is bounded by an 8s
   timeout, so a dead host never hangs discovery, auto-refresh, or startup.

### Paper sizes

`selphy_postcard` and `4x6` both map to the SELPHY's native
`jpn_hagaki_100x148mm` media (on the CP-1500 a "4x6" print **is** the postcard
sheet). `2x6_strip` has **no native SELPHY cut media** — the bridge prints the
already-composited strip onto a postcard sheet, so design the strip layout for
that sheet. Larger sizes (`5x7`, `6x8`, `a4`, `letter`) are best-effort and map
to the nearest standard IPP media keyword.

## Finding the bridge URL

- It's printed to **stdout** on startup.
- mDNS browse for it: `dns-sd -B _photocall-bridge._tcp` (macOS) or
  `avahi-browse -r _photocall-bridge._tcp` (Linux).
- Open `http://<host>:3200/qr` to scan a QR of the URL with a phone.

## Deployment

### Raspberry Pi / Linux (recommended)

A Raspberry Pi (any model with WiFi/Ethernet) is **strongly preferred** for
all-day reliability: it stays awake, keeps mDNS sockets open, and survives
network blips. Phones/laptops sleep and drop off the LAN.

Copy the matching Linux binary (`print-bridge-bun-linux-arm64` for a Pi,
`print-bridge-bun-linux-x64` for a mini-PC) onto the device — **no Bun/Node
install required** — then run it under systemd:

```bash
sudo cp print-bridge-bun-linux-arm64 /opt/print-bridge/print-bridge
sudo cp print-bridge.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now print-bridge
journalctl -u print-bridge -f   # follow logs
```

Edit `print-bridge.service` to match your install path/user and to point
`ExecStart` at the binary.

### Termux / Android (fallback)

Workable in a pinch but **a Pi is strongly preferred for all-day reliability** —
Android aggressively kills background processes and sleeps the radio. Bun has no
official Termux build, so run with Node there instead, or keep a small always-on
Linux box. Keep the device plugged in, on the same WiFi as the printer, with
`termux-wake-lock` engaged.
