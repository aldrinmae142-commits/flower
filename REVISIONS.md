# PetalHub - Revision Log, Round 2

Requested by the adviser: (1) GCash QR payment with verification, (2) pop-up notifications for every action, (3) a more professional UI/UX
that looks like a real online flower shop, (4) a wider page layout for both the customer and the admin side.

---

## 1. GCash QR code payment with payment verification

### How it works
**Customer**
1. Cart > Checkout > Pickup or Delivery > **Payment: "GCash (scan QR)"** or "Cash on delivery/pickup".
2. **Review order** > **Continue to GCash payment**. The order is *not* created yet.
3. The **Pay with GCash** screen shows the shop's QR code, the account name/number and the **exact amount to pay**. The customer scans the QR with the GCash app,
   sends the amount, then types the **13-digit GCash reference number** from the receipt (a screenshot of the receipt is optional).
4. **"I've paid - submit for verification"** saves the order as **awaiting payment verification**. The customer sees "Payment submitted" with a progress tracker.
5. When the shop verifies the payment the customer gets a pop-up *"Payment verified"* on whatever page they are on (no refresh needed) and the order is confirmed.
   If the payment is rejected the customer is told why and the order is cancelled.

**Admin** (Dashboard > Orders > **Verify payment**)
1. The order shows the reference number, the amount to match and the receipt screenshot (opens in a viewer).
2. The admin checks the GCash transactions, then presses **Verify payment** or **Reject payment** (with an optional note shown to the customer). Both ask for confirmation.
3. **The order cannot be marked Preparing until the payment is verified** (the button is disabled, and the server refuses it too).
4. Reject = order cancelled and the stock returned. Cancelling an order that was already verified reminds the admin to refund through GCash.

### Verification safeguards (enforced by `api.php`, not only by the screen)
| Safeguard | Detail |
|---|---|
| Reference number required | Exactly 13 digits (spaces are ignored) |
| One reference = one order | A `UNIQUE` index in the database refuses a reference number that was already used |
| No order without payment details | A GCash order is only created when the customer submits the reference number |
| Double-click / retry safe | The existing one-time checkout key still prevents duplicate orders |
| Admin-only actions | Verify, reject, view receipt, QR upload and account settings return 403 for customers |
| Receipt screenshots are private | Stored under random names in `payments/proofs` with a "deny all" `.htaccess`; only the admin API can open them |
| Upload checks | Only real PNG/JPG/WebP images, size-limited; resized in the browser; uploads can never run as PHP |
| Stock | Stock is deducted when the order is submitted and returned if the payment is rejected or the order cancelled |

### Admin setup of the QR code (no file editing)
Dashboard > **Payments**: upload the shop's real GCash QR image, set the account name and GCash number. A clearly marked **SAMPLE** QR is included so the screen works out of the box.

> **Honest limitation:** verification is done by the shop owner (a person checks the GCash transactions). It is not an automatic connection to GCash,
> which would require a GCash for Business / payment-gateway account. The QR code is the shop's own static QR, so the customer types the amount (the screen shows it clearly).

### Database changes (applied automatically on first run; also in `schema.sql`)
`orders.payment_status` (not_required / awaiting / verified / rejected), `orders.gcash_ref` (unique), `orders.payment_proof`, `orders.payment_note`, `orders.paid_at`;
`petalhub_settings` keys `gcash_name`, `gcash_number`, `gcash_qr`. The old "Credit / debit card" and "GCash / e-wallet" options were removed because they did not process anything.

---

## 2. System pop-up notifications
One notification system (`notify()` in `script.js`) replaces the old separate pop-ups. Notifications slide in at the top right (top of the screen on phones), stack up to four,
pause while the mouse is over them, can be closed, and some have action buttons (for example **View cart**). Four types: success, info, warning, error.

| Who | When a notification appears |
|---|---|
| Customer | Login, registration, logout, session expired, login/registration errors |
| Customer | Added to cart (with **View cart**), removed from cart, stock limit reached, cart changed because of stock |
| Customer | Pickup selected, delivery details saved, payment method selected, missing delivery details |
| Customer | GCash: copy number, screenshot added/removed, wrong reference number, reference already used |
| Customer | Order placed (cash), payment submitted (GCash), **payment verified**, **payment rejected** |
| Customer | Order status changes: preparing, ready / on its way, completed, cancelled (checked every 15 seconds, on every page) |
| Admin | Welcome (orders waiting), **new order received** (with **View orders**), new GCash payment to verify |
| Admin | Order status changed, order cancelled, payment verified / rejected |
| Admin | Flower saved/added/removed, weather and event flowers saved, rider saved/assigned |
| Admin | GCash account details saved, QR code updated |
| Everyone | Any server or network error is shown as an error notification with the reason |

A confirmation dialog is still used for actions that need an answer (cancel an order, remove a flower, verify/reject a payment).

---

## 3. UI/UX improvements (more like a real online flower shop)
- **Top bar:** announcement strip (same-day delivery, GCash/cash), navigation (Shop, My orders / Dashboard), account chip, Log in / Create account.
- **Home:** benefits strip, **search**, **sort** (featured, price low-high / high-low, name) and **In stock only** filter, product count, quick **Add to cart** button on every card,
  calmer cards (the 3D tilt effect was removed).
- **Checkout:** every step (cart, pickup/delivery, address, payment, review, GCash) has an **order summary beside it** with photos, totals, the chosen delivery/pickup and payment. The summary holds the main button.
- **Sign in / Register:** split layout with a flower photo panel and the form.
- **Confirmation page:** order summary, **progress tracker** (Order placed > Payment verified > Preparing > Ready/Out for delivery > Completed), clear message for GCash orders.
- **My orders:** card grid with progress tracker, payment badge and verification notes.
- **Footer:** shop information, links, accepted payments (GCash, Cash) and the photo credits.
- **Admin dashboard:** stat cards (orders today, pending, GCash to verify, low/out of stock), side menu (Orders, Products, Weather & Events, Customers, **Payments**),
  order cards with payment verification built in, **Verify payment** filter tab, product cards in a grid.
- Fully responsive: phones get a single column, the order summary moves below the form, the admin menu becomes a scrolling bar.

## 4. Wider layout
The page used to stop at 1120px with large empty margins. Content now stretches up to **1760px** (full width on laptops) with fluid side padding that shrinks on smaller screens.
This applies to the whole customer side and to the admin side. Checked for **no horizontal scrolling** at 1920, 1366, 820 and 390 px on every page, customer and admin.

---

## Other fixes
- **Cancelled orders now put a sold-out flower back on sale.** Before, cancelling an order returned the stock but the flower stayed "Out of stock".
- Removed old toast/popup code that is replaced by the notification system.

## Files
`api.php` (payment rules, verification, QR/settings, proof viewer), `script.js` (notifications, GCash screens, checkout layout, admin dashboard), `style.css` (layout and components),
`schema.sql` (new columns), `index.html` (new asset versions), `README.md`, `REVISIONS.md`; new folder `payments/` (sample QR + protected folders).

## Tests that were run
Real Apache + PHP + MariaDB, real browser:
- 51 API checks (GCash validation, duplicate/simultaneous submissions, verify/reject, proof upload and access control, QR and settings, old features) - on a new database **and** on the previous version's database (automatic migration).
- 47 end-to-end browser checks (guest to GCash order, QR display, notifications, admin verification, customer notified without refresh, cash order, My orders).
- 26 regression checks of the existing features (product page, custom bouquet and wrapping, riders, status flow, weather, products, rejected payment, reused reference).
- 36 layout checks (4 screen widths x customer and admin pages: no horizontal scrolling).

## How to test (checklist)
1. Admin: Dashboard > Payments: upload your QR, set name and number.
2. Customer: register > add a flower > checkout > Pickup > **GCash** > Review > Continue to GCash payment. See the QR and amount. Try 5 digits (warning), then a 13-digit reference (+ optional screenshot) > submit.
3. Expect: "Payment submitted" page, notification, and an order that is **awaiting verification**.
4. Admin: Orders > Verify payment: see the reference and screenshot. Try **Mark Preparing** (blocked). Press **Verify payment** > confirm.
5. Customer (do not refresh): a **Payment verified** notification appears and the page updates.
6. Repeat with **Reject payment**: the customer is told why and the stock returns. Try the same reference again: it is refused.
7. Place a **cash** order and walk it through Preparing > Ready > Completed as admin; the customer gets a notification at each step.
8. Resize the browser (or open it on a phone): the layout adapts and never scrolls sideways.
