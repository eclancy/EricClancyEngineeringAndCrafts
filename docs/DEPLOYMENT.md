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

## 6. DrawFight fighter submissions (ecec.dev/draw)

`/draw` (and `/drawfight`) is a form where people send in a drawing and their fighter's moves.
The page is `public/draw/index.html`; it posts to `/api/draw`, which the site's nginx hands to
the `intake` container (`intake/server.js`, built by `docker compose` alongside the site).

- Each submission is saved on the droplet as a folder under `/var/lib/drawfight-submissions/`:
  the photos, `answers.json` and a readable `sheet.md`. That folder is outside `/opt/ecec-hub`
  on purpose, so deploys never touch it.
- It is also emailed through Resend (DigitalOcean blocks outgoing SMTP). The key, and the
  address to send to, live only on the droplet, in `/etc/ecec/intake.env`:

  ```
  RESEND_API_KEY=re_...
  MAIL_TO=you@example.com
  ```

  then `cd /opt/ecec-hub && docker compose up -d intake`. Without the key, submissions are still
  saved; they just are not emailed. Without `MAIL_TO` they go to eric@ecec.dev. The ecec.dev
  domain must be verified in Resend for the `drawfight@ecec.dev` sender.

- Send straight to the inbox that reads them, not to an ecec.dev address: ecec.dev mail is
  forwarded on by Forward Email, and the first real submission's email was accepted by Resend
  and never arrived. Each submission's log line (`docker compose logs intake`) has its Resend id,
  which finds it on resend.com/emails to see whether it was delivered or bounced. The server's
  key is send-only, so that status cannot be read back with it.

- DrawFight's `tools/intake/pull_submissions.sh` copies new submissions down to
  `fighters/incoming/` for Claude Code.
- Limits: 8 photos, 12 MB each (the page shrinks big photos first), 5 submissions an hour per
  address, and a hidden trap field for bots. Host nginx allows 60 MB request bodies.
