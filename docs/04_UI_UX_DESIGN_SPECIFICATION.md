# UI/UX Design Specification & Visual Standards
## Project Name: Adalaj Packing Ops & Financial Intelligence System
**Document Version:** 1.0.0  
**Design Philosophy:** Industrial Elegance, Anti-AI Slop, High-Contrast Readability, Viewport Adaptive  

---

### 1. Brand Identity & Aesthetic Principles

#### 1.1 Brand Story
Adalaj Spices represents authentic Gujarat spice heritage, precision industrial packing, and transparent financial stewardship. The user interface blends the dignity of a heritage spice house with the clinical clarity required by production managers and financial auditors.

#### 1.2 Core Design Principles
1. **Zero-Pill Discipline:** Avoid childish, generic bubble capsules. Use crisp, purposeful geometric buttons with slight corner radius (`rounded-lg`, `rounded-xl`) and distinct micro-borders.
2. **True Dual-Theme Contrast (WCAG AAA Compliance):**
   - In factory environments with flour, turmeric dust, sunlight glare, or dim godown lighting, muted grays become unreadable.
   - Every text element must provide minimum 7:1 contrast ratio against its background.
   - No gray text under `text-slate-700` in light mode or `text-slate-300` in dark mode.
3. **Data Density & Viewport Presence:** Maximize visible data without requiring excessive vertical scrolling. Use side-by-side metric grids, clean tabular ledgers, and responsive accordions.
4. **Touch Ergonomics on Factory Floor:** Touch targets in Factory Floor Mode must exceed 64x64px for easy tapping with gloved or dusted hands.

---

### 2. Design Tokens & Color Matrix

#### 2.1 Primary Brand Colors
- **Adalaj Heritage Crimson:** `#9E1C23` (Light theme brand accent, primary CTA buttons, active tabs, header branding).
- **Crimson Dark Hover:** `#83161C` / `#7F1D1D`.
- **Harvest Gold / Amber Accent:** `#F59E0B` / `#D97706` (Metric highlights, status indicators, dark theme active badges).
- **Emerald Green (Profits / Cash Positive / Available):** `#059669` / `#10B981`.
- **Rose / Crimson Alert (Loss / Scrap / Scrap / Liabilities):** `#DC2626` / `#E11D48`.
- **Cyan / Sky Blue (Job Work / Contract Packer / Bank Transfers):** `#0284C7` / `#38BDF8`.

#### 2.2 Light Mode Palette (Crisp Heritage Canvas)
- **App Canvas Background:** `#FAF8F5` (Warm off-white rice paper tint, reducing blue-light screen glare).
- **Card & Modal Surface:** `#FFFFFF` (Pure white).
- **Primary Body Text:** `#0F172A` (Slate 900 - maximum clarity).
- **Secondary Text:** `#334155` (Slate 700 - never lower).
- **Card Borders:** `#CBD5E1` (Slate 300) to `#E2E8F0` (Slate 200).
- **Table Row Hover:** `#F1F5F9` (Slate 100).

#### 2.3 Dark Mode Palette (Industrial Midnight Cockpit)
- **App Canvas Background:** `#020617` (Slate 950 deep midnight).
- **Card & Surface Background:** `#0F172A` (Slate 900) with subtle borders `#1E293B` (Slate 800).
- **Primary Body Text:** `#F8FAFC` (Slate 50).
- **Secondary Text:** `#CBD5E1` (Slate 300).
- **Accent Text:** `#FBBF24` (Amber 400).
- **Card Hover:** `#1E293B` (Slate 800).

---

### 3. Typography System
- **Display & Headings:** `Playfair Display`, serif, semi-bold to bold (Used on company branding, financial milestone headers, and high-level reports).
- **UI & Controls:** `Montserrat`, sans-serif, weights 500 (medium), 600 (semi-bold), 700 (bold) (Used on buttons, inputs, navigation, table headers).
- **Numbers, Lot Numbers & Currency:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` with tabular figures (`font-mono font-bold`) ensuring perfect alignment of Indian currency figures (₹, Lakhs, Crores).

---

### 4. Responsive Device Adaptation Matrix

| Device Profile | Viewport Dimensions | UI Adaptation Strategy |
|---|---|---|
| **Vertical Smartphone** | < 640px wide (Portrait) | Fixed bottom navigation bar (Money, Batches, +Add, Stock, Menu), single-column stacked metric cards, full-width touch modal dialogs. |
| **Landscape Smartphone** | < 900px wide, aspect ratio > 1.8 | Collapsible slim icon rail (w-16) on the left side, multi-column compact grids, horizontal scrolling data tables. |
| **Square / Tablet POS** | 768px - 1024px (1:1 or 4:3) | Two-column cards, persistent sidebar (w-52), oversized touch buttons for rapid floor operations. |
| **Desktop / Laptop** | > 1024px (Widescreen) | Full 64-width navigation sidebar, 4-card metric cockpits, multi-column split views (batches on left, live recipe yield details on right). |

---

### 5. Core Component Design Patterns

#### 5.1 Financial Cockpit Banner ("Where Is My Money?")
- Rich gradient header transitioning from `#8B1D24` to `#9E1C23` with amber micro-accents.
- 4 embedded glassmorphic stat blocks with white and amber monospace figures.
- Direct quick-action CTAs: `+ New Batch`, `+ Quick Expense`, `Touch Floor Mode`.

#### 5.2 Status Badges & Chips
- **High-contrast dual tokens:**
  - `Available / Running / Active`: Light: `bg-emerald-100 text-emerald-900 border border-emerald-300` | Dark: `bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`.
  - `Hold / Quarantine`: Light: `bg-amber-100 text-amber-900 border border-amber-300` | Dark: `bg-amber-500/20 text-amber-300 border border-amber-500/30`.
  - `Exhausted / Voided / Terminated`: Light: `bg-rose-100 text-rose-900 border border-rose-300` | Dark: `bg-rose-500/20 text-rose-300 border border-rose-500/30`.

#### 5.3 Factory Floor Touch Console
- High-contrast card with 72px number counters for pack outputs.
- Large physical-touch buttons with tactile active states:
  - `+10 Packs` (Green emerald button)
  - `+50 Packs` (Deep teal button)
  - `+100 Packs` (Crimson brand button)
  - `+100g Spill Powder` (Amber button)
  - `+1 Damaged Foil Pouch` (Rose alert button)
- Toast popups confirming operations with audible tap feedback where enabled.
