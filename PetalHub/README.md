# PetalHub - Online Flower Ordering System
PHP + MySQL on **XAMPP** (Apache + MySQL + phpMyAdmin). No Node.js needed.

## Setup (about 3 minutes)
1. Open the **XAMPP Control Panel** and **Start Apache** and **Start MySQL**.
2. Copy this folder to `C:\xampp\htdocs\` so you get `C:\xampp\htdocs\PetalHub\index.html`
   (you can rename the folder, for example to `petalhub`).
3. Open http://localhost/phpmyadmin > **Import** > choose `schema.sql` > **Go**.
   *If you already have a `petalhub` database from an older version you can keep it: the system adds the new columns by itself the first time it runs.*
   *If the import shows a red error such as "Unknown column", the old database has a different structure. Drop it first (phpMyAdmin > petalhub > SQL > `DROP DATABASE petalhub;`) and import again.*
4. Open **http://localhost/PetalHub/** (or the folder name you used) and press **Ctrl + Shift + R**.

## Accounts
- **Admin:** `admin@petalhub.com` / `petalhub2026` (created automatically on first run; change it in `config.php`).
- **Customer:** Log in > Create account.

## GCash QR payments - set up before you present
1. Log in as admin > **Dashboard > Payments**.
2. **Choose a QR image**: upload the QR code from your own GCash app (GCash > QR > save it to your photos), then press **Use this QR code**.
   The QR code that comes with the project is only a **SAMPLE** and will not pay anyone.
3. Fill in **Account name** and **GCash mobile number** and press **Save account details**.
4. When a customer pays with GCash, the order appears under **Orders > Verify payment**. Check the reference number and amount in your GCash
   transactions, then press **Verify payment** (or **Reject payment**). See `REVISIONS.md` for the whole flow.

The `payments` folder must be writable (it is by default on XAMPP for Windows). Receipt screenshots are saved in `payments/proofs`, which cannot be opened by a direct link.

## Settings (`config.php`)
MySQL user/password (XAMPP default is `root` with no password), admin email/password, timezone, and `PH_DEBUG`
(shows the real reason when something goes wrong; set it to `false` when everything works).

## Troubleshooting
| You see | What to do |
|---|---|
| "Cannot reach the PetalHub server..." | Apache is not running, or the folder is not inside `xampp\htdocs`. Open the site through `http://localhost/...`, not by double-clicking `index.html`. |
| "Cannot connect to the MySQL database..." | Start MySQL in XAMPP, import `schema.sql`, and check `DB_PASS` in `config.php`. |
| "Server error. ..." with details | Take a screenshot of the whole message and send it to the developer. |
| The page looks old after an update | Press **Ctrl + Shift + R**. |
| "The QR image could not be saved" | Make sure the `payments` folder is not read-only. |
| The GCash QR shows "SAMPLE" | Upload your real QR in Dashboard > Payments. |

Documentation of the changes: `REVISIONS.md`. Duplicate-order check (older versions): `check-duplicates.sql`.
