# Product Brief — Delphine Ecosystem

## Who
Rev. Delphine Nforgwei — authority brand (marriage coaching / ministry), the
anchor of a four-brand ecosystem (Delphine, SMCC, E-Woman, DRIMP) operated by
Maxpromo Digital.

## Problem
The brands had disconnected sites and manual workflows. Content edits required a
developer. There was no single place to manage content, messages, and payments
across brands, and no safe way for a non-developer owner to edit a live website.

## Product
A single multi-tenant **Ecosystem OS** (control plane) that owns content and
operations for all brands, and per-brand public **websites** (rendering plane)
that display published content. For Delphine, the OS provides a website-first
editing experience: the owner opens the real website inside the OS canvas,
clicks a section, edits it inline, and publishes an immutable version.

## What it is NOT
Not a generic page-builder SaaS, not a template marketplace. The OS installs a
real editing/operations system onto real brand websites.

## Current state (2026-06-19)
- Delphine: full edit-the-website plane (preview → publish → rollback → click-to-edit).
- SMCC / E-Woman: consume the OS public content API (blog/events/pages) and use the
  generic OS-internal preview; no edit-the-website plane yet.
- DRIMP: no website (social-automation track only).
- P1E (this phase): generalized the Delphine-specific preview plane into a reusable,
  brand-agnostic architecture. No new brand activated.

## Non-goals this phase
No new features, no H8 activation, no CRM/email/WhatsApp/AI/payments work.
