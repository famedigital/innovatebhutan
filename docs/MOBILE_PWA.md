# Mobile ERP + PWA

Staff use **phones for daily work** (AMC, tickets, clients) and **desktop for detail** (payroll, accounts, long tables).

## Install (PWA)

Install only works when browser criteria are met (HTTPS or localhost, valid manifest, service worker, engagement).

1. Open `https://www.innovates.bt/login/` on the phone (HTTPS required; localhost works for Chrome testing).
2. **Android Chrome/Edge:** when the site is installable, tap **Install app** — this triggers the native install prompt (`beforeinstallprompt`).
3. **iPhone Safari:** tap **Add to Home Screen** → follow Share → Add to Home Screen (Apple does not expose a programmatic install API).
4. If the install button is hidden on desktop Chrome, the site is not yet installable (icons/SW/manifest) or already installed.

### Checklist if install never appears

- [ ] Served over HTTPS (or `localhost`)
- [ ] Manifest at `/manifest.webmanifest` with local PNG icons 192 + 512 (`/icons/…`)
- [ ] Service worker registered (`/sw.js`, secure context)
- [ ] Not already in standalone / installed
- [ ] Chrome: visit site a few times; BIP may be delayed

Manifest: `app/manifest.ts` · Service worker: `public/sw.js` · Offline: `/offline/`

## Mobile shell

- Bottom nav: Home · AMC · Tickets · Clients · **More** (bottom Drawer with scrollable full menu — not left sidebar)
- Compact header; SidebarTrigger desktop-only
- Warm stone + champagne chrome; emerald only for sparse CTAs / active icon

## Desktop

- Full sidebar + wider padding; bottom nav hidden (`md:hidden`)
