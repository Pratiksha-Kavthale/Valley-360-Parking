# Payment Documentation

This document describes the peer-to-peer UPI payment architecture, workflow, booking lifecycle interactions, owner configuration, verification process, security considerations, limitations, and suggested future enhancements.

## Purpose

Provide a single, detailed reference for how Valley360 implements payments. The platform intentionally does not integrate a payment gateway — payments are executed by customers in external UPI apps and then verified by owners or admins.

## Architecture Overview

- Payment type: Peer-to-peer UPI (Unified Payments Interface)
- Payment initiation: Backend generates a UPI payment URI and a ZXing-generated QR image (base64 PNG).
- Payment execution: Customer completes payment within a third-party UPI app (Google Pay, PhonePe, Paytm, BHIM, or similar).
- Verification: Customer uploads payment proof (screenshot or UTR/transaction reference); owner/admin verifies and updates booking status.

Key constraints:

- Valley360 does NOT process or hold customer funds.
- No gateway, escrow, wallet, commission, or automatic settlement is implemented.

## Payment Workflow

1. Owner configures their UPI details in Owner Settings (`OwnerPaymentConfig`):
   - `pa` (UPI ID, e.g., owner@bank)
   - `pn` (display name)

2. Customer creates a booking and reaches payment-required state.

3. System generates payment artifacts:
   - UPI payment URI of the form: `upi://pay?pa={upiId}&pn={displayName}&am={amount}&cu=INR`
   - A QR image encoding the raw UPI URI (ZXing -> PNG -> base64)

4. Customer either:
   - Scans the QR code with a UPI app (or camera) which should open the payment intent in the UPI app, OR
   - Clicks the "Open in UPI App" deep-link in the frontend which sets `window.location.href = paymentUri`.

5. Customer completes payment in their UPI app. This occurs entirely outside Valley360.

6. Customer returns to Valley360 and submits payment proof:
   - Screenshot of the UPI payment confirmation, OR
   - Transaction reference / UTR number shown by the UPI app

7. Owner or Admin inspects the proof and marks the booking as `PAYMENT_VERIFIED` (or rejects it).

8. Booking transitions to confirmed/completed state after verification.

## Booking Lifecycle & Payment Statuses

Typical booking states (examples used in codebase):

- `RESERVED` — booking created and awaiting payment
- `PAYMENT_PENDING` — payment required and QR/URI generated
- `PAYMENT_SUBMITTED` — customer submitted proof (awaiting owner/admin review)
- `PAYMENT_VERIFIED` — owner/admin accepted proof; booking confirmed
- `PAYMENT_REJECTED` — owner/admin rejected proof; booking may return to `PAYMENT_PENDING` or be cancelled
- `ACTIVE` / `COMPLETED` / `CANCELLED` — standard lifecycle states unaffected by payment handling once resolved

Ensure your client code maps UI states to these backend statuses and shows clear next steps for customers.

## Owner Configuration Process

1. Owner navigates to Owner Settings > Payment Settings.
2. Enter UPI ID (`pa`) — validated against a lightweight regex pattern like `^[\w.-]+@\w+$`.
3. Enter Display Name (`pn`) — this value may be URL-encoded for safe inclusion in URIs.
4. Save settings; the backend stores `OwnerPaymentConfig` for use in QR/URI generation.

Implementation notes:

- Do NOT URL-encode the entire URI. Only parameter values that require escaping (like display name) may be encoded.
- The owner UPI ID must be stored raw (not encoded) so UPI apps receive the correct `@` symbol.

## Verification Workflow (Owner/Admin)

1. Owner sees pending payment submissions in their payment-review queue.
2. Owner inspects uploaded proof (image or reference string) and any metadata (timestamp, payer name if provided).
3. Owner marks submission as `verified` or `rejected` with an optional note.
4. System updates booking status and notifies customer of the decision.

Recommended verification guidance for owners:

- Check that the amount, payee UPI ID, and timestamp are present in screenshot.
- Prefer UTR/transaction reference numbers where available for stronger evidence.
- If suspicious, reject and ask customer for clearer proof or bank/UPI statement snippet.

## Security Considerations

- Valley360 never stores or transmits UPI PINs or banking credentials.
- Payment execution is performed by third-party UPI applications; Valley360 only stores proof images and reference strings provided by customers.
- Store uploaded proofs securely (consider access controls and retention policies). `application.properties` may control `app.payment.proof-upload-dir` and related limits.
- Enforce file type and size limits on uploads. Sanitize metadata and scan images for malware if appropriate.
- Use HTTPS for all endpoints that transfer proofs or sensitive booking data.

## Limitations of the Peer-to-Peer Approach

- No automated confirmation: platform relies on manual verification unless owner provides an out-of-band verification process.
- No chargebacks/escrow: platform bears no responsibility for payment disputes between customer and owner.
- Reconciliation effort: owners must manually track and reconcile received payments if many transactions occur.
- Dependent on UPI apps' behavior: different UPI apps may parse QR/URI parameters slightly differently; test across prominent apps.

## Testing & Mobile App Notes

- When testing QR behavior on mobile, capture the raw payload shown by UPI apps (many apps show "View payment details" or raw data) to compare with backend `paymentUri` logs.
- Prefer percent-encoding (UTF-8) for spaces in `pn` if a specific UPI app requires `%20` instead of `+`.

## Future Enhancements

- Add optional webhook or webhook-like confirmation with banks/gateways (if owners adopt a settlement partner).
- Integrate optional third-party payment gateways (Razorpay, Stripe) as an alternative flow (must be explicit and opt-in).
- Add automated reconciliation via bank statement parsing or UPI/Bank APIs where legally permitted.
- Add stronger proof extraction (OCR on screenshots) to auto-extract UTR or amount for faster verification.

## Quick Reference: API Endpoints (relevant)

- `GET /booking/{bookingId}/payment-qr` — returns `paymentUri` and `qrCodeBase64`.
- `POST /booking/{bookingId}/payment-submission` — multipart upload: proof image + optional `transactionRef`.
- `POST /booking/{bookingId}/payment-verify` — owner/admin marks verified.
- `POST /booking/{bookingId}/payment-reject` — owner/admin rejects proof.

Keep this file synchronized with the backend controllers and DTOs in `BackEnd/Valley360-Parking`.
