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
- The DrawFight game posts here too: a fighter drawn in it to `/api/draw` (filed like any other),
  a stage drawn in it to `/api/draw/stage` (saved under `stages/`), and a suggestion typed in it
  to `/api/draw/suggest` (saved under `suggestions/`, no photos). Each is emailed the same way.
  DrawFight's `tools/intake/pull_submissions.sh` copies all three down.
- The other games' "Report a bug" posts to `/api/draw/suggest` too, with a `game` field that
  picks the email's subject from `REPORT_GAMES`. So does The Last Wizard: Survivors' Spell Index
  vote (`/the-last-wizard-survivors/spell-index`,
  `public/the-last-wizard-survivors/spell-index/index.html`): `game` is The One He Missed (the
  game's key, see below), `version` is `spell-index-vote`, and the pick and reason are the
  message. It also sends `kind` = `vote`, the one kind the intake reads, so that email is titled
  "The Last Wizard: Survivors Spell Index vote" rather than a bug report.
- A game that has been renamed keeps its old `game` value working through `RENAMED_GAMES`, so
  copies installed under the old name still have their reports filed under the new one. The Last
  Wizard: Survivors goes further: its key in `REPORT_GAMES` is still `The One He Missed`, the
  name it had when its bug report was written, because every installed copy and the vote page
  send that. Only the subject the key maps to says the new name.
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
- Each picture is saved as `photo-1`, `photo-2`... in the order sent, followed by the name it
  came with (`photo-3-fighter-front-arm.png`). The DrawFight game sends a fighter drawn in it as
  one picture per layer, named after the body part on it, and the importer matches by name.
- Limits: 24 pictures (the page itself takes 8; the game sends more), 12 MB each (the page
  shrinks big photos first), 5 submissions an hour per address, and a hidden trap field for
  bots. Host nginx allows 60 MB request bodies, and the game keeps a submission under that.

## 7. Game update emails (the sign-up on each game page)

Each game page (`/games/<id>`) has an "Email me updates" form (`src/components/UpdatesSignup.tsx`)
that posts to `/api/updates/subscribe`. The site's nginx hands `/api/updates/` to the `updates`
container (`updates/server.js`).

- **Who:** grown-ups only - the form asks for "13 or older", because these pages are visited by
  kids. Every sign-up gets a confirm email first; only confirmed addresses get updates.
- **When it emails:** it checks each game's newest GitHub Release every 10 minutes. A release
  with player-facing notes (`release.sh X.Y.Z "what changed"`) emails everyone confirmed for that
  game; a release without notes sends nothing. The first time it sees a game it only remembers
  the current release, so a fresh deploy never emails anyone.
- **Telling Eric:** each new confirmed sign-up emails `MAIL_TO` (the same address the intake
  uses, from `/etc/ecec/intake.env`): who signed up, for which game, and that game's total.
- **Unsubscribing:** every email has a link and the one-click `List-Unsubscribe` header. Opening
  the link shows a page with a button, so email scanners can't unsubscribe people by accident.
- **Storage:** `/data/subscribers.json` in the Docker named volume `updates-data` - kept across
  deploys, deleted only by `docker compose down -v`. Just emails, tokens and dates; no IPs, and
  nothing about subscribers goes in the logs. To see the list:
  `docker compose exec updates cat /data/subscribers.json`.
- **Sending:** through Resend with the same `RESEND_API_KEY` as the intake (it reads
  `/etc/ecec/intake.env`), from `ECEC Games <updates@ecec.dev>` (set `UPDATES_MAIL_FROM` there to
  change it). Replies go to `eric@ecec.dev` (Reply-To; `UPDATES_REPLY_TO` changes it), because
  `updates@ecec.dev` itself receives nothing - only `eric@` is forwarded. Optional: `GITHUB_TOKEN` there raises GitHub's rate limit; `POLL_MINUTES` changes
  how often it checks. Without the key, it prints emails to its log instead of sending them.
- **Locally:** `node updates/server.js` (dry run, no key needed) and `npm run dev` - Vite
  forwards `/api/updates` to it.
- **A new game:** add it to `GAMES` at the top of `updates/server.js`.
- **A renamed game:** give it its new id in `GAMES` and put old id -> new id in `RENAMED`. On
  start the server moves the old id's sign-ups (tokens and all) to the new one, and a sign-up
  form that still posts the old id is filed under the new one. A game renamed again keeps every
  older id in `RENAMED`, each pointed straight at the newest id.

## 7a. Renamed games: addresses that must keep answering

A downloaded game has its update address baked in, so renaming a game must never move that
address. The Last Wizard: Survivors has been renamed twice, and lives at
`/the-last-wizard-survivors/` and `/games/the-last-wizard-survivors`:

- **2026-11-02, Wizard Survivors to The One He Missed.** It moved from `/wizard-survivors/` and
  `/games/wizard-survivors` to `/the-one-he-missed/` and `/games/the-one-he-missed`, and its
  GitHub repo became `eclancy/TheOneHeMissed`.
- **2026-11-08, The One He Missed to The Last Wizard: Survivors.** It moved to its present
  addresses, and its GitHub repo became `eclancy/TheLastWizardSurvivors` (GitHub redirects the
  old slugs, release downloads and API included). The release files keep their names
  (`TheOneHeMissed-Setup.exe`, `-windows.zip`, `-linux.tar.gz`, `-android.apk`), and the
  intake's `game` key stays `The One He Missed` (section 6). The Windows shortcuts are named
  "The Last Wizard - Survivors", since a file name cannot hold a colon.

`nginx.conf` keeps four of its old addresses answering directly, forever, exactly as the new
ones do (no redirect for a copy to follow):

| Address                                 | Who asks it                               | Answers                                    |
| --------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| `/the-one-he-missed/version.json`       | every Windows and Linux copy from 0.12.0  | 302 to the newest release's `version.json` |
| `/the-one-he-missed/download` (and `/`) | every Android copy from 0.12.0            | 200, the download page                     |
| `/wizard-survivors/version.json`        | every Windows and Linux copy up to 0.11.0 | 302, the same                              |
| `/wizard-survivors/download` (and `/`)  | every Android copy up to 0.11.0           | 200, the download page                     |

Every other old address under `/the-one-he-missed`, `/games/the-one-he-missed`,
`/wizard-survivors` and `/games/wizard-survivors` (game page, art, clips, sprites, the Spell
Index vote link) is a 301 straight to its newest address, path and query kept - one hop, never
through the other old name. Update sign-ups stored under either old id move to
`the-last-wizard-survivors` when `updates/server.js` starts (`RENAMED`). A repo must be renamed
on GitHub before the site that names it is deployed, or the `version.json` redirect points at a
repo that does not exist yet.

```bash
curl -sI https://ecec.dev/the-last-wizard-survivors/version.json  # 302 to TheLastWizardSurvivors' release
curl -sI https://ecec.dev/the-one-he-missed/version.json          # 302, the same
curl -sI https://ecec.dev/wizard-survivors/version.json           # 302, the same
curl -sI https://ecec.dev/the-one-he-missed/download              # 200, the download page itself
curl -sI https://ecec.dev/wizard-survivors/download               # 200, the download page itself
curl -sI https://ecec.dev/the-one-he-missed/spell-index           # 301 to /the-last-wizard-survivors/...
curl -sI https://ecec.dev/wizard-survivors/spell-index            # 301 to /the-last-wizard-survivors/...
curl -sI https://ecec.dev/games/the-one-he-missed                 # 301 to /games/the-last-wizard-survivors
```

## 8. DrawFight online play (/api/play)

DrawFight plays online through room codes: one game hosts and gets a five-letter code, up to three
more join with it, and from then on the `play` container (`play/server.js`) passes each game's
messages to the others in its room. The games run in lockstep - each sends only what its players
pressed, a few bytes a frame - so the relay never decides anything and never sees a drawing or a
name. How the game uses it is `.ai/online.md` in eclancy/DrawFight.

- **One WebSocket per game**, at `wss://ecec.dev/api/play/ws`, kept open for the whole session.
  The site's nginx forwards `/api/play/` with the upgrade headers; the **host's** nginx needs them
  too, and since its config lives only on the droplet (written by `setup-droplet.sh`, then edited
  by certbot), every deploy runs `scripts/host-nginx-websockets.sh` over SSH. It adds the lines
  once, checks them with `nginx -t`, puts everything back if nginx refuses them, and does nothing
  on later deploys. `setup-droplet.sh` writes them in from the start on a new droplet.
- **Keeps nothing:** rooms live in memory while someone is in them; no log line names a code, a
  room or an address (nginx's access log is off for `/api/play/`).
- **Limits:** four games a room; a room is closed once the host starts (`lock`) or leaves, or
  after 20 quiet minutes; 64 KB a message and about 48 KB a second per game; 20 join attempts a
  minute per address, so codes cannot be found by trying them all; 500 rooms at once.
- **Versions must match:** a game can only join a room hosted by the same version, since
  lockstep needs both to run exactly the same code. The game says so and offers the update.
- **Checking it:** `curl https://ecec.dev/api/play/health` gives `{"ok":true,"rooms":N}`.
- **Locally:** `cd play && npm ci && node server.js`, then start DrawFight with
  `DRAWFIGHT_PLAY_URL=ws://127.0.0.1:3003/api/play/ws`.
