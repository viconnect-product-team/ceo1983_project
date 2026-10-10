---
name: ceo1983-association
description: Comprehensive operational, business, and UI guidance for developing, maintaining, and extending the CEO 1983 Association (HanoiBA) application.
---

# CEO 1983 Association Application Skill

This skill defines the technical standards, architectural patterns, and business domain knowledge for the **CEO 1983 Association Mobile Web Application** (`@ceo1983/app_fe`), located in `apps/ceo1983_app_fe`.

## 1. Domain & Purpose

The application serves business owners, founders, and C-level executives in the **CLB Doanh Nhân CEO 1983** . It is not a generic social network; it is an executive digital ecosystem designed for:
- **Executive Identity & Digital Card**: Luxury smart member card with company logo branding, personal QR code, and public digital visiting card (`/card/:code`).
- **B2B Strategic Networking & Deals**: Targeted meeting requests (`[B2B_CONNECT_INVITE]`) with business purpose, contact info, and opportunity attachments.
- **Internal B2B Marketplace**: Enterprise product directory with luxury Obsidian & Amber sponsor carousels and direct in-app seller negotiation.
- **Realtime Opportunities**: Aggregated supply, demand, and joint venture deals with live valuation metrics.
- **Event & Meeting Governance**: Online voting directly tied to physical/virtual general assemblies, board meetings, and conventions.
- **Administration & Committee RBAC**: Admin-controlled permission assignment across 7 specialized association committees.

---

## 2. Directory Structure & Key Files

All association-specific routes and components live inside `apps/ceo1983_app_fe`:

```
apps/ceo1983_app_fe/
├── src/
│   ├── routes/
│   │   ├── association.index.tsx          # Home: Facebook-style quick profile edit, active news, quick pills
│   │   ├── association.card.tsx           # Member Card: Company logo, QR below logo, contract + profile, scanner
│   │   ├── association.members.tsx        # Directory: Icon-only buttons, B2B Connect Bottom Sheet integration
│   │   ├── association.messages.tsx       # Messenger: Interactive B2B meeting invitation cards, call logs, tickets
│   │   ├── association.opportunities.tsx  # Opportunities: Realtime deal value & stats bar, post & match deals
│   │   ├── association.products.tsx       # Marketplace: Obsidian sponsor carousel, message seller directly
│   │   ├── association.events.tsx         # Events: Full event listings, ticket booking, lucky draw
│   │   ├── association.voting.tsx         # Voting: Active & history tabs tied to events/meetings with live %
│   │   ├── association.permissions.tsx    # Admin: Member permission management for 7 committees
│   │   ├── association.profile.tsx        # Profile: Compact executive identity, links to Card & Admin RBAC
│   │   ├── card.$code.tsx                 # Public QR Scan Card: Matching member card layout + privacy toggles
│   ├── components/
│   │   ├── common/
│   │   │   ├── QuickProfileEditModal.tsx   # Facebook-style instant profile & logo editor
│   │   │   ├── BusinessConnectBottomSheet.tsx # B2B meeting proposal drawer with opportunity linking
│   │   ├── member/
│   │   │   ├── Ceo1983BusinessCardVisit.tsx # Reusable official executive visit card
│   │   │   ├── ContactSupportModal.tsx    # Contact directory of all 7 committees & 24/7 helpdesk
│   │   │   ├── UserGuideModal.tsx         # Interactive step-by-step tour + admin-only PDF upload
│   │   │   ├── MemberShell.tsx            # Executive header & mobile navigation shell
```

---

## 3. Executive UI & Color Standards (CHỈ ĐÚNG 3 MÀU CHUẨN CEO 1983)

Always strictly apply the official CEO 1983 palette:
1. **Primary Cobalt Navy**: `#003B95`, `#002B70`, `#0A1A3A` (Header, Primary CTA buttons, official badge).
2. **Accent Warm Amber Gold**: `#F59E0B`, `#D97706`, `#B45309`, `#FEF3C7` (VIP card border, gold star, CRM deal values, interest button).
3. **Neutral Contrast**: `#FFFFFF` (Clean white background) and `#0F172A` (Obsidian luxury dark card).
- **CẤM TUYỆT ĐỐI**: Màu tím (purple), hồng (pink), xanh lá chuối (lime), xanh neon, dải màu cầu vồng.
- **CẤM TUYỆT ĐỐI HARD DỮ LIỆU / MOCK DATA**: 100% dữ liệu phải nạp từ PostgreSQL qua NestJS RESTful API (`fetchNestApi`).

### Button-to-Icon Minimization
Do NOT clutter screens with bulky text buttons. Use sleek single-color Lucide icons (`<MessageSquare />`, `<Phone />`, `<User />`, `<Handshake />`). Reserve full buttons only for critical decisions (Edit Profile, Accept Meeting, Cast Vote).

---

## 4. Architectural Rules

1. **Route Generation**:
   Whenever a new route file is added or renamed in `src/routes/`, always execute:
   ```bash
   npm run routes:gen
   ```
   This regenerates `routeTree.gen.ts` before running TypeScript checks.

2. **TypeScript Integrity**:
   Verify code changes with:
   ```bash
   npx tsc --noEmit
   ```
   Must pass with **0 errors**.

3. **Git Hygiene**:
   **STRICT PROHIBITION**: Absolutely NEVER execute `git push` or `git commit`.

---

## 5. Standard Event & Storage Keys

- `vba_custom_profile`: Local active profile overrides.
- `vba_member_company_logo`: Member's company logo URL.
- `vba_member_avatar_photo`: Member's personal avatar photo.
- `vba_member_cover_photo`: Member's home cover photo.
- `vba_member_permissions`: Admin permissions map (`memberCode` -> `MemberPermissionProfile`).
- `vba_meeting_votes`: Voting sessions and voter ballot storage.
- Custom dispatch events:
  - `vba_member_company_logo_updated`
  - `vba_member_avatar_updated`
  - `vba_member_cover_updated`
  - `vba.connection.changed`
