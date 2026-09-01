#!/usr/bin/env bash
# One-shot bootstrap for the Zolpo demo on a fresh Ubuntu/Debian host.
# Idempotent: safe to re-run. Run as a sudo-capable user.
#
#   curl -fsSL https://raw.githubusercontent.com/Azizbek1731/zolpo.co.il/main/deploy/setup.sh | bash
# or
#   sudo bash deploy/setup.sh
set -euo pipefail

REPO="${REPO:-https://github.com/Azizbek1731/zolpo.co.il.git}"
APP_DIR="${APP_DIR:-/opt/zolpo}"
DOMAIN="${DOMAIN:-zolpo.pro100.cyou}"
EMAIL="${EMAIL:-azizbekatoyev13@gmail.com}"
PORT="${PORT:-3000}"

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

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
  sudo git -C "$APP_DIR" fetch --all --quiet
  sudo git -C "$APP_DIR" reset --hard origin/main --quiet
else
  sudo git clone --quiet "$REPO" "$APP_DIR"
fi

say "Building and starting the container"
cd "$APP_DIR"
sudo docker compose up -d --build

say "Waiting for the app to answer on :$PORT"
for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$PORT/api/homepage?rows=3" >/dev/null 2>&1; then
    echo "app is up"; break
  fi
  [ "$i" = 60 ] && { echo "app did not start"; sudo docker compose logs --tail=50; exit 1; }
  sleep 2
done

say "Configuring nginx for $DOMAIN"
sudo cp deploy/nginx-zolpo.conf /etc/nginx/sites-available/zolpo
sudo sed -i "s/zolpo\.pro100\.cyou/$DOMAIN/g" /etc/nginx/sites-available/zolpo
sudo ln -sf /etc/nginx/sites-available/zolpo /etc/nginx/sites-enabled/zolpo
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/html
sudo nginx -t && sudo systemctl reload nginx

say "Checking that $DOMAIN resolves to this host before asking for a certificate"
SERVER_IP="$(curl -fsS https://checkip.amazonaws.com || echo unknown)"
DOMAIN_IP="$(getent hosts "$DOMAIN" | awk '{print $1; exit}' || echo none)"
echo "  this server : $SERVER_IP"
echo "  $DOMAIN -> $DOMAIN_IP"

if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
  say "Issuing the Let's Encrypt certificate"
  sudo apt-get install -y -qq certbot python3-certbot-nginx
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
  sudo systemctl reload nginx
  echo "Done: https://$DOMAIN"
else
  cat <<MSG

DNS is not pointing here yet, so the certificate step is skipped.
Add this record at your DNS provider, wait for it to propagate, then re-run:

    Type: A     Name: zolpo     Value: $SERVER_IP     TTL: 300

    sudo bash $APP_DIR/deploy/setup.sh

The site is already reachable over plain HTTP at: http://$SERVER_IP
MSG
fi
