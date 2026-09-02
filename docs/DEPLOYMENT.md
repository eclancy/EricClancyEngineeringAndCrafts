# Deployment

`ecec.dev` runs on a single DigitalOcean droplet: host Nginx + certbot terminate TLS
and reverse-proxy to a Dockerized build of this app.

## 0. Prerequisites (done once, manually)

- `doctl` is installed locally. Authenticate it with a DigitalOcean personal access
  token (create one at https://cloud.digitalocean.com/account/api/tokens, Droplets +
  Domains + Firewalls read/write scope is enough): `doctl auth init`.
- A dedicated deploy SSH keypair has been generated at `~/.ssh/ecec_hub_deploy`
  (`ecec_hub_deploy.pub` is the public half). Upload the public key to your DO account
  so it can be attached to the droplet:
  `doctl compute ssh-key import ecec-hub-deploy --public-key-file ~/.ssh/ecec_hub_deploy.pub`

## 1. One-time droplet provisioning

```powershell
doctl compute ssh-key list                     # find the imported key's ID
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

Required GitHub Actions secrets (repo Settings → Secrets and variables → Actions):

- `DROPLET_HOST` — droplet IPv4 or hostname
- `DROPLET_HOST_NAME` — public hostname used for the post-deploy health check (`ecec.dev`)
- `DROPLET_USER` — SSH user (`root`, since that's what `--ssh-keys` provisions)
- `DROPLET_SSH_KEY` — contents of the private key `~/.ssh/ecec_hub_deploy` (the matching
  public key was attached to the droplet at creation time via `--ssh-keys`)

## 5. Verifying

```bash
curl -I https://ecec.dev        # expect 200 and a valid cert
ssh root@<droplet-ip> "certbot certificates"
```

Certbot's systemd timer renews certificates automatically; `certbot renew --dry-run`
on the droplet can be used to sanity-check renewal.
