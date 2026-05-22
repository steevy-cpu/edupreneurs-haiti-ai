#!/usr/bin/env bash
# Finalize v4 — add subtle film grain over the master render.
# Input: $1 (master mp4), Output: $2 (final mp4)
set -euo pipefail
IN="${1:-/mnt/documents/edupreneurs-promo-master.mp4}"
OUT="${2:-/dev-server/public/edupreneurs-promo.mp4}"
ffmpeg -y -i "$IN" \
  -vf "noise=alloc=1:c0s=2:allf=t" \
  -c:v libx264 -preset slow -crf 18 -tune film \
  -x264-params "aq-mode=3:aq-strength=1.0" \
  -pix_fmt yuv420p -movflags +faststart \
  -an "$OUT"
echo "[finalize] wrote $OUT"
ls -lh "$OUT"
