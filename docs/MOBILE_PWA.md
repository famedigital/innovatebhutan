# Mobile ERP + PWA

Staff use **phones for daily work** (AMC, tickets, clients) and **desktop for detail** (payroll, accounts, long tables).

## Install (PWA)

1. Open `https://www.innovates.bt/login/` on the phone (HTTPS required; localhost works for testing).
2. Tap **Install ERP App** on the login screen (or Admin header / profile menu).
3. **Android Chrome/Edge:** browser install prompt or Install button.
4. **iPhone Safari:** Install button shows guidance → Share → **Add to Home Screen**.

Manifest: `app/manifest.ts` · Service worker: `public/sw.js` · Offline page: `/offline/`

## Mobile shell

- Bottom nav: Home · AMC · Tickets · Clients · More (opens full sidebar sheet)
- Compact header + safe-area padding
- Dashboard 2-column quick-action cards (mobile only)

## Desktop

- Full sidebar + wider padding; bottom nav hidden (`md:hidden`)
