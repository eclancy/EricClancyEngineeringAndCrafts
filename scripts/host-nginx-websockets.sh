#!/usr/bin/env bash
# Lets WebSockets through the host's nginx to the site's container, for DrawFight online
# (/api/play, play/server.js). The host's site config was written by setup-droplet.sh and then
# edited by certbot, so it lives only on the droplet; this adds the three lines a WebSocket needs
# to every place it hands requests to the container.
#
# Run by every deploy (deploy.yml), and safe to: once it is done it changes nothing. If nginx
# does not accept the result, everything is put back as it was and the deploy fails.
set -euo pipefail

SITE=/etc/nginx/sites-available/ecec.dev
MAP=/etc/nginx/conf.d/websocket-upgrade.conf
made_map=0
edited_site=0

if [ ! -f "$MAP" ] && ! grep -rqs 'connection_upgrade' /etc/nginx/nginx.conf /etc/nginx/conf.d; then
	cat > "$MAP" <<'EOF'
# A WebSocket asks to be upgraded; everything else is an ordinary request, closed as usual.
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
EOF
	made_map=1
fi

if ! grep -q 'proxy_set_header Upgrade' "$SITE"; then
	cp "$SITE" "$SITE.before-websockets"
	sed -i 's|^\([[:space:]]*\)proxy_pass http://127.0.0.1:8080;|&\n\1proxy_http_version 1.1;\n\1proxy_set_header Upgrade $http_upgrade;\n\1proxy_set_header Connection $connection_upgrade;\n\1proxy_read_timeout 120s;|' "$SITE"
	edited_site=1
fi

if [ "$made_map" = 0 ] && [ "$edited_site" = 0 ]; then
	echo "host nginx already lets WebSockets through"
	exit 0
fi

if nginx -t; then
	systemctl reload nginx
	echo "host nginx now lets WebSockets through"
else
	[ "$edited_site" = 1 ] && mv "$SITE.before-websockets" "$SITE"
	[ "$made_map" = 1 ] && rm -f "$MAP"
	echo "nginx did not accept the WebSocket lines - put back as it was" >&2
	exit 1
fi
