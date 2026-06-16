# @sferadev/print-bridge

A tiny always-on network service that prints composited photobooth strips to an
AirPrint/IPP photo printer (built and tested against the **Canon SELPHY
CP-1500** over WiFi) **silently**, with no print dialog.

The photocall kiosk talks to this bridge over HTTP. The bridge:

- discovers AirPrint/IPP printers on the LAN over **mDNS/Bonjour**,
- advertises **itself** over mDNS (`_photocall-bridge._tcp`) so operators can
  find it without typing an IP,
- accepts print jobs over a small REST API,
- prints them directly via **IPP** (no CUPS / OS print queue required),
- retries failed jobs with exponential backoff, one job at a time (dye-sub
  printers can't interleave jobs).

## Why a separate service?

Browsers can only print through the OS print dialog (`window.print()`). To print
**automatically** and **silently** we need to speak IPP from a process on the
network — that's this bridge. The kiosk's "AirPrint manual" mode still uses
`window.print()` for iPads with no bridge; the bridge is the "Auto bridge" mode.

## Quick start

```bash
pnpm install
pnpm -F @sferadev/print-bridge build
PORT=3200 node apps/print-bridge/dist/server.js
# or, for development:
pnpm -F @sferadev/print-bridge dev
```

On startup it logs the listen URL and begins discovering printers. Point the
photocall admin "Print" tab → bridge URL at `http://<bridge-host>:3200`.

## Environment variables

| Variable                  | Default | Description                                                            |
| ------------------------- | ------- | ---------------------------------------------------------------------- |
| `PORT`                    | `3200`  | HTTP port for the REST API + QR endpoint.                              |
| `BRIDGE_ALLOWED_ORIGINS`  | `*`     | Comma-separated CORS allowlist, or `*` to reflect any origin.          |
| `BRIDGE_USE_TLS`          | `false` | Build `ipps://` URIs (TLS) instead of `ipp://`.                        |
| `BRIDGE_IPP_VERSION`      | `2.0`   | IPP version to negotiate first (auto-falls back to `1.1`).             |
| `BRIDGE_API_KEY`          | —       | Optional shared secret; required on `/api/*` as Bearer or `x-api-key`. |

## REST API

| Method   | Path                          | Description                                              |
| -------- | ----------------------------- | ------------------------------------------------------- |
| `GET`    | `/health`                     | `{status, uptime, jobsPending, jobsFailed, printerCount}` |
| `GET`    | `/api/status`                 | Bridge + printer snapshot.                               |
| `GET`    | `/api/printers`               | Discovered printers (refreshes live state first).       |
| `GET`    | `/api/printers/:id/status`    | Live state for one printer (`:id` URL-encoded).          |
| `POST`   | `/api/printers/discover`      | Re-query mDNS for printers.                              |
| `POST`   | `/api/jobs`                   | Submit a print job (see below).                          |
| `GET`    | `/api/jobs`                   | Last 50 jobs.                                            |
| `GET`    | `/api/jobs/:id`               | One job's status.                                        |
| `DELETE` | `/api/jobs/:id`               | Cancel a still-pending job.                              |
| `GET`    | `/qr`                         | PNG QR code of the bridge's own URL (operator pairing).  |

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

### Raspberry Pi (recommended)

A Raspberry Pi (any model with WiFi/Ethernet) is **strongly preferred** for
all-day reliability: it stays awake, keeps mDNS sockets open, and survives
network blips. Phones/laptops sleep and drop off the LAN.

```bash
# Build, then copy the app (incl. node_modules) to /opt/print-bridge
sudo cp print-bridge.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now print-bridge
journalctl -u print-bridge -f   # follow logs
```

Edit `print-bridge.service` to match your install path and user.

### Termux / Android (fallback)

Workable in a pinch but **a Pi is strongly preferred for all-day reliability** —
Android aggressively kills background processes and sleeps the radio.

```bash
pkg install nodejs
termux-wake-lock                 # stop the OS sleeping the process/radio
# Install termux-services to keep it running:
pkg install termux-services
mkdir -p $PREFIX/var/service/print-bridge
# create a `run` script that execs: node /path/to/dist/server.js
sv-enable print-bridge
```

Keep the device plugged in, on the same WiFi as the printer, and leave
`termux-wake-lock` engaged.
