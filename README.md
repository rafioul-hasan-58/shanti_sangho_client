# shanti_sangho_server

Website for Shanti Sangha sporting club. English + Bangla, member dashboard, admin dashboard, green theme.

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS 3

## Run
```bash
npm install
npm run dev     # http://localhost:3000  (redirects to /en)
```

## Where to change things
| I want to change... | Edit |
|---|---|
| Colors | `tailwind.config.ts` |
| Any text (English / Bangla) | `src/i18n/dictionaries/en.json` and `bn.json` |
| Hero slides | `dictionaries/*.json` -> `hero.slides`, look in `components/home/HeroCarousel.tsx` |
| Navbar links | `components/layout/Navbar.tsx` |

## Finance Module (`/admin/finance`)

### Routes
- `/admin/finance` (localized to `/[locale]/admin/finance`): Central treasury overview with 3 stat cards (Total Raised, Total Spent, Total Remaining), fund cards grid with low-balance (<10%) warning badges, "Spending by fund" bar chart, "Last 6 months in vs out" area chart, and recent activity ledger.
- `/admin/finance/funds/[id]` (localized to `/[locale]/admin/finance/funds/[id]`): Fund detail ledger with live remaining balance, budget utilization bar, filterable Contributions & Expenses tables with server-side pagination, read-only transaction detail drawer, receipt voucher modal, and CSV export.

### API Contract Assumptions (NestJS)
The finance client (`src/lib/api/finance.ts`) calls the following endpoints using the authenticated bearer token:
- `GET  /finance/funds` -> `[{ id, name, isActive, totalIn, totalOut, remaining }]`
- `POST /finance/funds` -> `{ name }`
- `GET  /finance/funds/:id/summary` -> `{ totalIn, totalOut, remaining }`
- `GET  /finance/contributions?fundId&from&to&method&q&page&limit` -> `{ data: Contribution[], total, page, limit, totalPages }`
- `POST /finance/contributions` -> `{ fundId, amount, method, receivedAt, receivedById, giverMemberId?, giverName?, note?, reference? }`
- `GET  /finance/expenses?fundId&from&to&q&page&limit` -> `{ data: Expense[], total, page, limit, totalPages }`
- `POST /finance/expenses` -> `{ fundId, amount, spentAt, spentOn, spentById?, note?, receiptUrl? }`
- `GET  /members/get-all?searchTerm=` -> Searchable member combobox for contributor/receiver pickers

*Fallback:* When the NestJS endpoints are offline or returning 404 during local development, `lib/api/finance.ts` transparently operates with an in-memory / localStorage store pre-seeded with funds (`GPL`, `OWAG`, `SPORTS`, `FOOTBALL`, `MAINTENANCE`, `OTHER`), contributions, and expenses. New contributions and expenses immediately update fund balances.

