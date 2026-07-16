# SavePlate — UC1–UC3 Frontend

A React + Tailwind CSS implementation of the SavePlate case study, covering:

- **UC1 — Register Users & Privacy Settings**: Register, Verify Email, 2FA setup, Login, 2FA verify, Forgot/Reset Password, and a full Settings page (profile, privacy/visibility, security) that was missing from the original mockups but required by the use case ("settings can be updated anytime from the account dashboard").
- **UC2 — Manage Food Inventory**: Inventory list with filters/sort, Add/Edit item (shared modal), Item Details, Delete confirmation, Mark as Used, Convert to Donation.
- **UC3 — Browse Food Items**: Browse Donations grid with category/search filters, a My Inventory tab (Inventory vs Donations toggle per the use case spec), Donation Details, Claim flow with confirmation, Create Listing.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    layout/       Sidebar, TopBar, AppLayout, AuthLayout — the shared navbar/shell used on every screen
    ui/            Generic building blocks: Button, Input, Select, Modal, Badge, EmptyState, ToastStack
    auth/          OtpInput, PasswordStrengthMeter
    inventory/     AddEditItemModal, ConfirmDeleteModal, InventoryRow
    donations/     DonationCard, CreateDonationModal
  pages/
    auth/          Register, VerifyEmail, SecureAccount, Login, VerifyIdentity, ForgotPassword, ResetPassword
    inventory/     InventoryList, ItemDetails
    donations/     BrowseDonations, DonationDetails
    settings/      Settings (profile / privacy / security tabs)
    Welcome.jsx, Dashboard.jsx, Notifications.jsx, MealPlanner.jsx (placeholder, UC6 not in scope)
  context/         AuthContext, InventoryContext, DonationContext, NotificationContext (React Context + useState, no backend)
  hooks/           useAuth, useInventory, useDonations, useNotifications, useFilters
  data/            mockData.js — seed data so the app is fully demoable without an API
  utils/           dateUtils.js (expiry calculations), validators.js (form validation)
  routes/          ProtectedRoute.jsx
  App.jsx          Route table
  main.jsx         Entry point, wraps the app in all providers
```

## Notes

- All authenticated screens share the same `Sidebar` + `TopBar` via `AppLayout`, so navigation is identical everywhere.
- State is in-memory only (React Context) — refreshing the page resets data. Swap the context implementations for real API calls when a backend is ready.
- Tailwind config carries over the exact design tokens (colors, spacing, type scale) from the original Stitch mockups so visual style stays consistent.
- Screens added beyond the original Stitch exports to satisfy the use case spec: **Settings/Privacy page**, **Mark as Used action**, **Inventory vs Donations browse toggle**, and **empty states** for both Inventory and Browse.
