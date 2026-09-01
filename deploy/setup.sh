#!/usr/bin/env bash
# Bootstrap the Zolpo demo on an Ubuntu/Debian host that may already be serving
# other sites. Idempotent — safe to re-run, and it never touches an nginx server
# block it did not create.
#
#   curl -fsSL https://raw.githubusercontent.com/Azizbek1731/zolpo.co.il/main/deploy/setup.sh | bash
set -euo pipefail

REPO="${REPO:-https://github.com/Azizbek1731/zolpo.co.il.git}"
APP_DIR="${APP_DIR:-/opt/zolpo}"
DOMAIN="${DOMAIN:-zolpo.pro100.cyou}"
EMAIL="${EMAIL:-azizbekatoyev13@gmail.com}"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m    %s\033[0m\n' "$*"; }

say "Installing prerequisites"
sudo apt-get update -qq
sudo apt-get install -y -qq ca-certificates curl git nginx

if ! command -v docker >/dev/null 2>&1; then
  say "Installing Docker"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER" || true
fi

say "Fetching the app into $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  sudo git -C "$APP_DIR" fetch --quiet --all
  sudo git -C "$APP_DIR" reset --quiet --hard origin/main
else
  sudo git clone --quiet "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# The host already runs other sites, so 3000 may be taken. Claim the first free
# port and carry the same value into the nginx upstream.
APP_PORT="${APP_PORT:-}"
if [ -z "$APP_PORT" ]; then
  for p in $(seq 3000 3020); do
    if ! (sudo ss -ltn "sport = :$p" 2>/dev/null | grep -q LISTEN); then APP_PORT="$p"; break; fi
  done
fi
[ -n "$APP_PORT" ] || { echo "no free port in 3000-3020"; exit 1; }
say "Using host port $APP_PORT"
echo "APP_PORT=$APP_PORT" | sudo tee "$APP_DIR/.env" >/dev/null

say "Building and starting the container"
sudo docker compose --env-file "$APP_DIR/.env" up -d --build

say "Waiting for the app to answer on :$APP_PORT"
for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$APP_PORT/api/homepage?rows=3" >/dev/null 2>&1; then
    echo "    app is up"; break
  fi
  [ "$i" = 60 ] && { echo "app did not start"; sudo docker compose logs --tail=60; exit 1; }
  sleep 2
done

say "Adding the nginx site for $DOMAIN"
sudo cp deploy/nginx-zolpo.conf /etc/nginx/sites-available/zolpo
sudo sed -i "s/__DOMAIN__/$DOMAIN/g; s/__APP_PORT__/$APP_PORT/g" /etc/nginx/sites-available/zolpo
sudo ln -sf /etc/nginx/sites-available/zolpo /etc/nginx/sites-enabled/zolpo
sudo mkdir -p /var/www/html
# Deliberately NOT removing sites-enabled/default or any other site.
sudo nginx -t && sudo systemctl reload nginx

say "Checking DNS before asking Let's Encrypt for a certificate"
SERVER_IP="$(curl -fsS --max-time 10 https://checkip.amazonaws.com | tr -d '[:space:]' || echo unknown)"
DOMAIN_IP="$(getent hosts "$DOMAIN" | awk '{print $1; exit}' || true)"
echo "    this server : ${SERVER_IP:-unknown}"
echo "    $DOMAIN -> ${DOMAIN_IP:-not resolving}"

if [ -n "${DOMAIN_IP:-}" ] && [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
  say "Issuing the certificate"
  sudo apt-get install -y -qq certbot python3-certbot-nginx
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
  sudo systemctl reload nginx
  printf '\n\033[1;32m    Done: https://%s\033[0m\n\n' "$DOMAIN"
else
  warn ""
  warn "DNS does not point here yet, so the certificate step was skipped."
  warn "Add this record at your DNS provider (ahost.uz):"
  warn ""
  warn "    Type A   Name zolpo   Value ${SERVER_IP:-<this server's IP>}   TTL 300"
  warn ""
  warn "Then re-run this same command — it will pick up where it left off."
  warn "Meanwhile the site is already live over plain HTTP at:"
  warn "    http://${SERVER_IP:-<this server's IP>}"
  warn ""
fi
