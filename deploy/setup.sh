#!/usr/bin/env bash
# Deploy the Zolpo demo on an Ubuntu host with Node + pm2 + nginx.
#
# Written against the target box, which already serves four other sites from
# /home/ubuntu/<app> under pm2 with certbot-managed nginx — so this follows that
# house pattern instead of introducing Docker. It is idempotent: re-run it to
# ship a new commit.
#
#   bash deploy/setup.sh
# or, first time on a clean box:
#   curl -fsSL https://raw.githubusercontent.com/Azizbek1731/zolpo.co.il/main/deploy/setup.sh | bash
set -euo pipefail

REPO="${REPO:-https://github.com/Azizbek1731/zolpo.co.il.git}"
APP_DIR="${APP_DIR:-$HOME/zolpo}"
APP_NAME="${APP_NAME:-zolpo}"
DOMAIN="${DOMAIN:-zolpo.pro100.cyou}"
EMAIL="${EMAIL:-azizbekatoyev13@gmail.com}"
PORT="${PORT:-3200}"
# The box has ~2 GB of RAM shared with Postgres, Redis and three other apps.
HEAP_MB="${HEAP_MB:-1024}"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m    %s\033[0m\n' "$*"; }

command -v node >/dev/null || { echo "node is required"; exit 1; }
command -v pm2  >/dev/null || { echo "pm2 is required: npm i -g pm2"; exit 1; }

say "Fetching $REPO into $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch -q --all
  git -C "$APP_DIR" reset -q --hard origin/main
else
  git clone -q "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"
echo "    $(git log --oneline -1)"

# Bash keeps executing the copy of this file that existed when it started, so a
# checkout that ships a *different* deploy strategy would be ignored — that is how
# a stale Docker-era script once redeployed on top of a pm2 install, installed
# Docker on a 90%-full disk and repointed nginx at the wrong port. Re-exec
# whenever the pull changed this script (or when we were piped in via curl and
# have no file to compare against).
if [ "${ZOLPO_REEXEC:-}" != "1" ]; then
  SELF_NOW=""
  [ -r "${BASH_SOURCE[0]:-}" ] && SELF_NOW="$(sha256sum "${BASH_SOURCE[0]}" | cut -d" " -f1)"
  SELF_REPO="$(sha256sum "$APP_DIR/deploy/setup.sh" | cut -d" " -f1)"
  if [ "$SELF_NOW" != "$SELF_REPO" ]; then
    say "This script changed in the checkout — re-running the new one"
    exec env ZOLPO_REEXEC=1 bash "$APP_DIR/deploy/setup.sh" "$@"
  fi
fi

say "Installing dependencies"
npm ci --no-audit --no-fund --silent

say "Building (heap capped at ${HEAP_MB}MB so the other services keep their RAM)"
NODE_OPTIONS="--max-old-space-size=$HEAP_MB" npm run build

# `output: "standalone"` emits a self-contained server plus a minimal node_modules;
# the static assets and public/ have to be placed next to it by hand.
say "Assembling the standalone bundle"
rm -rf .next/standalone/public .next/standalone/.next/static
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
# Reclaim ~500 MB: the build-time dependency tree is not needed at runtime.
rm -rf node_modules
echo "    bundle: $(du -sh .next/standalone | cut -f1)"

say "Restarting $APP_NAME on :$PORT under pm2"
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
PORT="$PORT" HOSTNAME=127.0.0.1 NODE_ENV=production \
  pm2 start .next/standalone/server.js --name "$APP_NAME" --time >/dev/null
pm2 save --force >/dev/null

for i in $(seq 1 30); do
  curl -fsS -o /dev/null "http://127.0.0.1:$PORT/api/homepage?rows=3" && { echo "    app is up"; break; }
  [ "$i" = 30 ] && { echo "app did not start"; pm2 logs "$APP_NAME" --lines 40 --nostream; exit 1; }
  sleep 2
done

if [ ! -e /etc/nginx/sites-enabled/"$APP_NAME" ]; then
  say "Adding the nginx site for $DOMAIN"
  sudo sed "s/__DOMAIN__/$DOMAIN/g; s/__APP_PORT__/$PORT/g" deploy/nginx-zolpo.conf \
    | sudo tee /etc/nginx/sites-available/"$APP_NAME" >/dev/null
  sudo ln -sf /etc/nginx/sites-available/"$APP_NAME" /etc/nginx/sites-enabled/"$APP_NAME"
  # Deliberately never touching sites-enabled/default or any other site.
  sudo nginx -t && sudo systemctl reload nginx
else
  say "nginx site already present, leaving it alone (certbot manages the TLS block)"
fi

if sudo test -d "/etc/letsencrypt/live/$DOMAIN"; then
  say "Certificate already issued — certbot.timer handles renewal"
else
  SERVER_IP="$(curl -fsS --max-time 10 https://checkip.amazonaws.com | tr -d '[:space:]' || echo '')"
  DOMAIN_IP="$(getent hosts "$DOMAIN" | awk '{print $1; exit}' || true)"
  if [ -n "$DOMAIN_IP" ] && [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    say "Issuing the certificate"
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
    sudo systemctl reload nginx
  else
    warn "DNS points at ${DOMAIN_IP:-nothing}, this host is ${SERVER_IP:-unknown} — skipping certbot."
    warn "Add:  A   ${DOMAIN%%.*}   $SERVER_IP   TTL 300   then re-run this script."
  fi
fi

printf '\n\033[1;32m==> https://%s\033[0m\n\n' "$DOMAIN"
