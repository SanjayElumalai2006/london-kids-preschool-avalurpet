# Changelog

All notable changes to the London Kids Preschool Avalurpet web application are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-21

### Added
- **Web-Only Responsive Architecture**:
  - Full browser responsive layout optimized across mobile, tablet, laptop, and desktop viewports.
  - Complete removal of Progressive Web App (PWA) manifests, service workers, and app-install popups.
- **Personal Email-Only User Management**:
  - Replaced mandatory institutional/school email requirements with `Personal Email Address` as the single required email and login identifier across all roles (`OWNER`, `ADMIN`, `TEACHER`, `STAFF`, `PARENT`, `STUDENT`).
  - Account enrollment and user editing forms updated to require only personal email.
  - Login system accepting registered personal email address or 10-digit mobile number.
  - Secure credential hashing via SHA-256 (`passwordHash`); elimination of plaintext password storage in database and UI.
  - Forced first-time password change mechanism (`mustChangePassword`) for newly enrolled or temporary accounts.
- **Multi-Child Parent Portal**:
  - Parents can now link to multiple enrolled children (`studentIds: string[]`).
  - Interactive multi-child switcher banner on Parent Portal (`/portal/parent`) with quick-switch pills.
  - Scoped attendance records, teacher reviews, progress reports, and exam grades dynamically filtered by active child selection.
- **Student Soft-Delete & Restore Lifecycle**:
  - Added student status tracking (`ACTIVE`, `INACTIVE`, `REMOVED`), `removedAt`, and `removedBy`.
  - Soft-delete ("Remove") and "Restore" actions with confirmation modals in Admin Student Records table.
  - Filter by Active, Removed, or All students in student management views.
  - Automatic exclusion of removed/inactive students from dashboard counts on Admin, Owner, and Teacher views.
- **Direct WhatsApp Admission Enquiries**:
  - Integrated direct WhatsApp enquiry URLs targeting `https://wa.me/919043633545` (+91 90436 33545).
  - Standardized pre-filled message generator (`getWhatsAppEnquiryUrl`) formatting parent name, child name, age, selected program, and contact phone.
  - WhatsApp enquiry buttons active across Home hero, Home inline enquiry, Programs cards & CTA, Contact page sidebar & form, and Enquiry submission confirmation.
- **Bot Protection & Email Verification**:
  - Cloudflare Turnstile CAPTCHA component on public admission enquiry forms (`TurnstileCaptcha`) with server-side challenge verification endpoint (`/api/turnstile`).
  - Server-side parent email verification workflow (`/api/parent/verify-email`) with token validation and documented development bypass/test mode.
- **Auditing & Security**:
  - Centralized audit logging recording user enrollments, role updates, password resets, removals, and restorations.
  - Passwords masked and never revealed in audit logs, user lists, or console output.
