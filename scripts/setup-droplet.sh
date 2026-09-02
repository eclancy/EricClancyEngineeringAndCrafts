#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu LTS DigitalOcean droplet hosting ecec.dev.
# Run as root (or with sudo) on the droplet: `bash setup-droplet.sh`.
set -euo pipefail

DOMAIN="ecec.dev"
APP_DIR="/opt/ecec-hub"

apt-get update
apt-get install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx ufw

# Docker Engine + Compose plugin (official repo)
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Firewall: only SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p "$APP_DIR"

# Host Nginx reverse-proxies to the Dockerized app on 127.0.0.1:8080.
cat > /etc/nginx/sites-available/ecec.dev <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/ecec.dev /etc/nginx/sites-enabled/ecec.dev
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Issues + installs the TLS cert, and configures the auto-renew redirect.
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@${DOMAIN}" --redirect

echo "Setup complete. Deploy the app into ${APP_DIR} and run: docker compose up -d --build"
