# HRDocs AI — Build Plan

A web app for Indian SMBs to generate HR documents (offer letters, leave policies, warning letters) using AI.

## Stack & key decisions

- **Auth + backend**: Lovable Cloud (email/password auth, edge functions).
- **AI**: Lovable AI Gateway via a secure edge function. The requested `claude-sonnet-4-20250514` model is not available on the gateway. I'll default to `google/gemini-3-flash-preview` (fast, high quality, free during promo). If you need a specific provider, tell me and I'll switch.
- **Design**: Clean minimal white with blue accents (`hsl(217 91% 60%)` primary), generous whitespace, subtle shadows, rounded corners. Inter font.
- **PDF export**: client-side with `jspdf`.

## Pages & routes

- `/auth` — Email + password sign in / sign up (Lovable Cloud auth, email confirmation auto-confirmed for dev).
- `/` — Dashboard (protected). Three cards: Offer Letter, Leave Policy, Warning Letter.
- `/generate/offer-letter` — Form + result view.
- `/generate/leave-policy` — Form + result view.
- `/generate/warning-letter` — Form + result view.

## Forms (fields per document)

**Offer Letter** (as specified):
Company name, Employee full name, Job title, CTC per annum (₹), Joining date, Probation period (months), Work location (city).

**Leave Policy**: Company name, number of employees, leave types to include (casual/sick/earned), annual leave days, work location/state.

**Warning Letter**: Company name, Employee name, Employee designation, Date of incident, Description of issue, Severity (verbal/written/final).

(Let me know if you want different fields for the last two — I'll go with these as sensible defaults.)

## Result view (shared component)

- Generated document shown in a clean read-only text area.
- **Copy** button (clipboard).
- **Download as PDF** button (jspdf, A4, wrapped text, company name as filename).
- Loading state + error toasts for rate limits (429) and credit exhaustion (402).

## Backend (Edge Function)

Single edge function `generate-hr-doc`:
- Input: `{ docType: 'offer' | 'leave' | 'warning', fields: {...} }`
- Builds the system + user prompt per docType (offer letter prompt matches your wording).
- Calls Lovable AI Gateway, returns plain text.
- CORS enabled; validates input with Zod; JWT-verified (only logged-in users).

## File structure

```text
src/
  pages/
    Auth.tsx
    Dashboard.tsx
    OfferLetter.tsx
    LeavePolicy.tsx
    WarningLetter.tsx
  components/
    DocumentResult.tsx   (textarea + Copy + PDF)
    ProtectedRoute.tsx
  hooks/useAuth.ts
  lib/pdf.ts
  integrations/supabase/...
supabase/functions/generate-hr-doc/index.ts
```

## Out of scope (ask if you want them)

- Saving generated documents to a database / history.
- User profile table.
- Multiple users per company / roles.
- Rich-text editing of the result.

Ready to build when you approve.