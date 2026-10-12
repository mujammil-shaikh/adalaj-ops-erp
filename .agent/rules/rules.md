# Agent Rules & Architectural Directives
## Adalaj Packing Ops Hub
**Version:** 1.1

### Core Operational Invariants
1. **Integer Arithmetic:** Money = integer paise. Quantities = integer base units (grams, pieces). Zero floating point for balance/stock math.
2. **Dynamic Configuration:** Zero hardcoded business categories, tax rates, expense heads, SKU specs, or machine limits. Configuration is stored as database rows.
3. **No Destructive Deletion:** Posted financial, stock, tax, and payroll records cannot be hard deleted. Use reversal/void with reason and maintain audit trails.
4. **Posting Service:** All writes modifying ledgers or stock route through the central Posting Service with idempotency keys and audit logging.
5. **Security & Input Validation:** Zod schema validation on every payload. Parameterized SQL queries only. Server-side RBAC on every API route.
6. **No Secrets in Code:** Cloudflare Secrets / `.dev.vars` only. Never expose keys or PII in logs or client bundles.
7. **Packaging Truth:** Production is a packing run, not baking/roasting. Pouch packaging is flexible pouch/roll film, not rigid cylinder cans.

Refer to `AGENTS.md` and `docs/MASTER_BUILD_PROMPT.md` for full specifications.
