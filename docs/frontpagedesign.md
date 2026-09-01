# Landing Page Marketing Content Redesign

## Goal Description
The current landing page consists entirely of the search hero. To align with the Monster.com layout and improve conversion, we need to transition from the dark hero into a light-themed content section that sells the **value proposition, services, and trust mechanisms** of SpotEngineer. The information is drawn directly from the architecture and business requirements in `spotOn.md`.

## Proposed Changes

### 1. Structure Updates (`src/app/page.tsx`)
We will rebuild the Homepage to follow a classic marketplace funnel:
- **[Existing] Dark Hero:** The high-contrast search box and location finder.
- **[New] Trust Badges:** A slim section highlighting our guarantees (e.g., "Aadhaar Verified", "Secure Escrow", "On-Site Support").
- **[New] Features Grid (Light Theme):** A modern grid explaining *why* to use SpotEngineer (Instant Geofenced Dispatch, Verified Talent, Escrow Payments).
- **[New] Services Catalog (Light Theme):** Highlighting the specific IT services available (Network/Security, Cloud, Remote AMC).
- **[New] Dual CTA Footer:** "Hire an Engineer" vs "Apply as an Engineer".

### 2. Styling Updates (`src/app/page.module.css`)
- Remove the `min-height: 100vh` restriction on the main container so the page can scroll.
- Apply `.dark-surface` strictly to the Hero and Navbar.
- The new sections below will naturally inherit the light mode `globals.css` we created in the previous task, fulfilling the Two-Tone theme requirement perfectly.
- We will add clean, soft-shadow cards for the features and services grids.

## Open Questions / User Review Required
> [!IMPORTANT]
> Since this is a significant marketing addition, I'll be synthesizing the copy based on `spotOn.md`.
> - **Services included:** Network/Security, Cloud, AMC, Software/AI.
> - **Value Props:** Aadhaar-verified talent, 40km geofenced dispatch, Split-Escrow Payments.
> 
> Should I proceed with generating this marketing copy and implementing the scrolling light-themed layout?
