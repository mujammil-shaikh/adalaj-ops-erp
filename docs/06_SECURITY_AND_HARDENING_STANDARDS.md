# Security & Hardening Standards (The 19-Point Directive)
## Project Name: Adalaj Packing Ops & Financial Intelligence System
**Document Version:** 1.0.0  
**Security Baseline:** OWASP ASVS Level 2 + SOC2 / ISO 27001 Financial & Audit Controls  
**Target Environment:** Cloudflare Edge (Workers, WAF, Turnstile, KV, D1, R2)  

---

### Executive Security Mandate
Because this system tracks physical factory powder lots, inventory movements, statutory tax withholdings, bank accounts, and high-value payments, security must be implemented at the protocol, transport, network, edge isolate, and database layers.

---

### The 19 Security Directives Implementation Specification

#### Directive 1: Hide My API Keys (Zero Client-Side Exposure)
- **Rule:** Never embed Google Gemini API keys, Cloudflare API tokens, bank webhooks, or encryption secrets into client-side Vite bundles (`import.meta.env.VITE_*`).
- **Enforcement:**
  - Gemini AI queries execute exclusively server-side via Cloudflare Worker isolate (`/api/ai/analyze-batch`).
  - Secrets are injected at runtime via Cloudflare Worker Secrets (`wrangler secret put GEMINI_API_KEY`).
  - Static bundle auditing runs on every build (`npm run build`) to ensure no string matching `AIzaSy*` or private key tokens exist in `dist/`.

#### Directive 2: Check My Environment Variables
- **Rule:** Maintain a clean `.env.example` documenting all configuration keys without exposing actual production credentials.
- **Enforcement:**
  - Client `.env` files contain only public runtime variables prefixed with `VITE_` (e.g. `VITE_APP_NAME`, `VITE_API_BASE_URL`).
  - Worker environment variables (`D1_DATABASE_ID`, `R2_BUCKET_NAME`, `JWT_SECRET`) are validated on worker startup using Zod schema validation:
    ```typescript
    const EnvSchema = z.object({
      JWT_SECRET: z.string().min(32),
      GEMINI_API_KEY: z.string().startsWith('AIzaSy'),
      ENVIRONMENT: z.enum(['development', 'production']),
    });
    ```

#### Directive 3: Protect Admin Routes
- **Rule:** Sensitive operations (approving expenses > ₹50,000, database snapshot rollback, salary rate modification, machine decommissioning) require Owner authorization.
- **Enforcement:**
  - Edge middleware verifies the JWT claim `role === 'owner'`.
  - Client-side navigation guards render access-denied UI if an unauthorized role navigates to administrative views.
  - Double-confirmation dialog with owner password or biometric passkey prompt for destructive/reversal operations.

#### Directive 4: Proper Authentication
- **Rule:** Industry-standard token-based authentication using cryptographically signed JWTs or HttpOnly secure cookies.
- **Enforcement:**
  - Access tokens have short lifespans (15 minutes).
  - Refresh tokens stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies with automatic rotation on use.
  - Integration with Cloudflare Zero Trust / Cloudflare Access for factory internal networks where applicable.

#### Directive 5: Check User Access (Role-Based Access Control - RBAC)
- **Rule:** Strict enforcement of least privilege across all 6 roles:
  - `owner`: Full privileges.
  - `accountant`: Financial vouchers, bills, accounts, parties, and ledger views. No batch yield deletion.
  - `supervisor`: Batches, machine operational logs, recipe management, inventory viewing. No financial ledgers.
  - `operator`: Restricted to Factory Floor Mode touch counter.
  - `store_keeper`: Inward lots, stock dispatch notes, location movements.
  - `ca_auditor`: Strictly read-only access to all reports, trial balance, and tax summaries.

#### Directive 6: Sanitize My Forms
- **Rule:** Every user input (text fields, batch notes, party names, supplier invoice strings) must be validated and sanitized before persistence.
- **Enforcement:**
  - Strict type coercion with Zod schemas on both frontend and backend.
  - Stripping leading/trailing whitespace, null bytes (`\0`), and control characters.
  - Numbers, amounts, and weights constrained to positive values within physiological limits (e.g., batch weight > 0 and <= 50,000 kg).

#### Directive 7: Protect Against XSS (Cross-Site Scripting)
- **Rule:** Zero injection of untrusted user data into HTML or DOM execution sinks.
- **Enforcement:**
  - React’s native JSX automatic string escaping used exclusively.
  - Ban on `dangerouslySetInnerHTML`.
  - DOMPurify applied to any rich text or markdown export output.
  - Strict Content Security Policy (CSP) header preventing inline scripts:
    `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self';`

#### Directive 8: Add Rate Limiting
- **Rule:** Prevent brute-force attacks, credential stuffing, and denial-of-wallet on AI endpoints.
- **Enforcement:**
  - Cloudflare KV Token Bucket rate limiting deployed on API routes:
    - Auth endpoints (`/api/auth/*`): 5 attempts per IP per 15 minutes.
    - AI Analysis endpoints (`/api/ai/*`): 10 requests per user per minute.
    - Transaction entry (`/api/transactions/*`): 120 requests per minute.
  - Cloudflare Turnstile integration on login and password reset forms.

#### Directive 9: Secure API Endpoints
- **Rule:** All edge endpoints require authentication headers (except public health checks and login).
- **Enforcement:**
  - Authorization header format: `Bearer <jwt_token>`.
  - Parameter tampering protection: checking that the authenticated user has jurisdiction over the modified entity.
  - Replay attack mitigation: including timestamp and random nonce in signed payloads.

#### Directive 10: Check CORS Settings
- **Rule:** Disallow wildcard `Access-Control-Allow-Origin: *` on private or transactional endpoints.
- **Enforcement:**
  - Explicit whitelist restricting requests to the verified application origins:
    - Production: `https://ops.adalajspices.com`
    - Development: `http://localhost:3000`
  - Required headers:
    - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
    - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`
    - `Access-Control-Allow-Credentials: true`

#### Directive 11: Add Security Headers
- **Rule:** Edge Workers and Cloudflare Pages inject HTTP security headers on all responses:
  ```http
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=()
  ```

#### Directive 12: Turn Off Debug Mode in Production
- **Rule:** Never leak stack traces, SQL queries, internal IP addresses, or framework error dumps to client responses.
- **Enforcement:**
  - Global error boundary returning standardized sanitized JSON:
    `{"error": "InternalServerError", "message": "An unexpected error occurred. Request ID logged.", "requestId": "req_884f1a"}`
  - Detailed errors sent to private Cloudflare Worker Tail logs or Datadog, never to browser console.

#### Directive 13: Update Dependencies & Patch Vulnerabilities
- **Rule:** Zero known high or critical CVE vulnerabilities in the dependency graph.
- **Enforcement:**
  - Automated CI scanning with `npm audit --production` and Dependabot / Renovate bot.
  - Pinned lockfile (`bun.lock` / `package-lock.json`) committed to version control.

#### Directive 14: Remove Unused Packages
- **Rule:** Minimal surface area reduces bundle size and supply-chain attack vectors.
- **Enforcement:**
  - Regular execution of `depcheck` and Vite rollup tree-shaking verification.
  - Removal of heavy unused charting or utility libraries in favor of lightweight native implementations.

#### Directive 15: Check for Exposed Files
- **Rule:** Never serve `.git/`, `.env*`, `wrangler.toml`, backup files (`.bak`), or private keys through the web server.
- **Enforcement:**
  - Cloudflare Pages configuration rules blocking requests to dotfiles:
    `/_headers`, `/_routes.json`, and static block rules for `.*`.
  - Client build output restricted solely to public compiled assets.

#### Directive 16: Secure Database Access (Prepared Statements)
- **Rule:** Absolute elimination of string-concatenated SQL queries.
- **Enforcement:**
  - 100% of queries use Drizzle ORM parameterized prepared statements on Cloudflare D1.
  - Parameter binding: `db.prepare("SELECT * FROM transactions WHERE account_id = ?").bind(accountId)`.
  - Least-privilege D1 database bindings defined in `wrangler.toml`.

#### Directive 17: Hash Passwords Properly
- **Rule:** Never store plaintext or legacy MD5/SHA1 passwords.
- **Enforcement:**
  - State-of-the-art password hashing using **Argon2id** (memory: 64MB, iterations: 3, parallelism: 4) or **bcrypt** with work factor cost >= 12.
  - Salt generated cryptographically per user using Web Crypto API (`crypto.getRandomValues`).

#### Directive 18: Check Git for Secrets (Pre-Commit & History Scanning)
- **Rule:** Ensure no API key, private key, or password is ever committed to the repository history.
- **Enforcement:**
  - Gitleaks / Trufflehog scanning in pre-commit git hooks.
  - Immediate rotation policy if a credential is accidentally committed, treating all repository history as potentially compromised.

#### Directive 19: Run Full Security Audit
- **Rule:** Continuous auditing lifecycle.
- **Enforcement:**
  - SAST (Static Application Security Testing) via ESLint security plugins.
  - DAST (Dynamic Application Security Testing) scanning with OWASP ZAP against staging endpoints.
  - Comprehensive Audit Log table recording all user mutations: timestamp, user ID, role, action, entity, old value, and new value.
