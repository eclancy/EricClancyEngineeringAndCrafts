# Deployment

`ecec.dev` runs on a single DigitalOcean droplet: host Nginx + certbot terminate TLS
and reverse-proxy to a Dockerized build of this app.

## 1. One-time droplet provisioning

Prerequisites on your machine: `doctl` installed and authenticated (`doctl auth init`),
an SSH key added to your DO account.

```powershell
doctl compute ssh-key list                     # find your key's ID/fingerprint
doctl compute droplet create ecec-hub `
  --region nyc1 `
  --size s-1vcpu-1gb `
  --image ubuntu-24-04-x64 `
  --ssh-keys <your-ssh-key-id> `
  --tag-names ecec-hub `
  --wait
doctl compute droplet list                     # note the public IPv4
```

## 2. DNS

Point `ecec.dev` (and `www.ecec.dev`) A records at the droplet's IPv4 — either via your
registrar, or by adding the domain to DigitalOcean:

```powershell
doctl compute domain create ecec.dev --ip-address <droplet-ip>
doctl compute domain records create ecec.dev --record-type A --record-name www --record-data <droplet-ip>
```

## 3. Droplet software setup (one time)

Copy `scripts/setup-droplet.sh` to the droplet and run it as root:

```bash
scp scripts/setup-droplet.sh root@<droplet-ip>:/root/
ssh root@<droplet-ip> "bash /root/setup-droplet.sh"
```

This installs Docker, host Nginx, certbot, configures the firewall (22/80/443 only),
and issues the TLS certificate for `ecec.dev`.

## 4. Ongoing deploys

Push to `main` — `.github/workflows/deploy.yml` builds the app, rsyncs it to
`/opt/ecec-hub` on the droplet, and runs `docker compose up -d --build` over SSH.

Required GitHub Actions secrets:

- `DROPLET_HOST` — droplet IPv4 or hostname
- `DROPLET_HOST_NAME` — public hostname used for the post-deploy health check (`ecec.dev`)
- `DROPLET_USER` — SSH user (e.g. `root` or a deploy user)
- `DROPLET_SSH_KEY` — private key matching a public key authorized on the droplet

## 5. Verifying

```bash
curl -I https://ecec.dev        # expect 200 and a valid cert
ssh root@<droplet-ip> "certbot certificates"
```

Certbot's systemd timer renews certificates automatically; `certbot renew --dry-run`
on the droplet can be used to sanity-check renewal.
