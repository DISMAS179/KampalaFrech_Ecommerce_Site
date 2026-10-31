# Kampala Fresh - Mobile-First Online Grocery Delivery MVP

A production-ready, mobile-first web application for **"Kampala Fresh"**, an online fresh produce and grocery delivery service tailored specifically for busy households and small offices in **Kampala, Uganda**.

Optimized for mobile users with limited data, fast first load, clear UGX currency formatting, local Ugandan produce, standard Kampala delivery fees, and mobile money payment workflows (MTN MoMo, Airtel Money, Pay on Delivery).

---

## 📁 Complete Folder Structure

```
├── .env.example                  # Environment configuration template
├── index.html                    # Single-page HTML shell with SEO & theme color
├── metadata.json                 # AI Studio applet metadata & permissions
├── package.json                  # Dependencies & scripts (Node.js/Express/Vite)
├── schema.sql                    # Production MySQL 8.0 schema + 20 seeded Kampala products
├── server.ts                     # Express REST API + in-memory store + Vite middleware
├── tsconfig.json                 # TypeScript compiler options
├── vite.config.ts                # Vite build and Tailwind configuration
├── README.md                     # Documentation, architecture & testing guide
└── src/
    ├── main.tsx                  # React DOM bootstrap
    ├── App.tsx                   # Main SPA container & view coordinator
    ├── index.css                 # Tailwind CSS 4 setup & utility classes
    ├── types.ts                  # TypeScript data models (Order, Product, Status)
    ├── data/
    │   └── mockProducts.ts       # 20 realistic Kampala items & Kampala delivery areas
    ├── services/
    │   └── api.ts                # API client with offline resilience & localStorage cache
    └── components/
        ├── Header.tsx            # Sticky brand header, search bar & basket counter
        ├── CategoryNav.tsx       # Horizontal scrolling category chips (Vegetables, Fruit, etc.)
        ├── ProductCard.tsx       # Touch-friendly card with UGX price, unit & stepper
        ├── ProductDetailModal.tsx# Deep-dive product preview & origin details
        ├── BasketDrawer.tsx      # Cart with UGX 20,000 min-order rule & UGX 3,000 fee
        ├── CheckoutModal.tsx     # Ugandan phone validation, areas, slots & substitution policy
        ├── PaymentModal.tsx      # MTN MoMo & Airtel Money simulator with failure retry
        ├── OrderTrackingModal.tsx# 4-stage tracking (Received, Packing, Out for delivery, Delivered)
        ├── AdminModal.tsx        # Password-protected admin (Order status, stock toggle, revenue)
        ├── WhatsAppButton.tsx    # Sticky WhatsApp button with pre-filled order message
        └── DataSaverBadge.tsx    # Low-data notification & quality commitments
```

---

## 🚀 Key Features

1. **Home & Instant Search**:
   - High-contrast search bar with real-time filtering for items like *matooke, tilapia, sukuma wiki, milk, onions*.
   - 5 primary categories: **Vegetables**, **Fruit**, **Staples**, **Dairy & Eggs**, and **Meat & Fish**.
   - Featured items section highlighting daily morning market arrivals.

2. **Product Listing & Product View**:
   - High-quality, compressed imagery with native lazy-loading for low-bandwidth 3G/4G connections.
   - Price in Ugandan Shillings (`UGX`), clear units (`kg`, `bunch`, `cluster`, `litre`, `tray`, `piece`).
   - Stock status (`In Stock`, `Low Stock`, `Out of Stock`).
   - Instant touch steppers (`+` / `-`).

3. **Basket & Order Rules**:
   - **Enforced Minimum Order**: Minimum produce subtotal of `UGX 20,000` with an interactive progress meter showing how much more is needed.
   - **Flat Delivery Fee**: `UGX 3,000` flat delivery fee clearly separated across Kampala.

4. **Checkout & Kampala Delivery Details**:
   - Ugandan phone number input supporting MTN (`077/078/076`) and Airtel (`070/075/074`).
   - Dropdown of 20 recognized Kampala delivery areas (*Kololo, Nakasero, Ntinda, Bugolobi, Muyenga, Naguru, Bukoto, Kansanga, Naalya, Entebbe Road, etc.*).
   - Delivery slots:
     - 🌅 Morning (08:00 AM - 12:00 PM)
     - ☀️ Afternoon (12:00 PM - 04:00 PM)
     - 🌆 Evening (04:00 PM - 08:00 PM)
   - Substitution preferences (*"Call me first"*, *"Replace with similar"*, *"Do not replace"*) and special notes.

5. **Payment (MTN MoMo, Airtel Money, Pay on Delivery)**:
   - **MTN Mobile Money (MoMo)** and **Airtel Money** simulation endpoints ready to bridge to telecom aggregators (e.g. Beyonic, Flutterwave, MTN Open API).
   - "Payment Pending" state with countdown timer and simulated USSD PIN push notification screen.
   - **Simulate Failure & Retry**: Test failed payments with actionable retry or fallback to *Pay on Delivery*.

6. **Order Confirmation & Tracking**:
   - Live visual status stepper through 4 clear milestones:
     1. `Received` (Queued at depot)
     2. `Packing` (Produce sorted and washed)
     3. `Out for delivery` (Boda rider dispatched)
     4. `Delivered` (Delivered to customer)
   - Order lookup by reference code (e.g., `KF-8821`).

7. **Admin Dashboard (Password Protected)**:
   - Secure staff login (Default demo password: `kampala2026`).
   - Financial & operational analytics: Daily Orders, Total Revenue (UGX), Average Order Value (AOV).
   - Order Management: 1-click status updater (`Received` ➔ `Packing` ➔ `Out for delivery` ➔ `Delivered`).
   - Inventory Management: Add new produce items, edit price in UGX, and toggle stock availability.

8. **"Order on WhatsApp" on Every Page**:
   - Floating action button formatted with Uganda country code `+256 772 123 456`.
   - Generates a pre-filled, itemized message directly including basket contents, delivery area, and total cost in UGX.

---

## 🛠️ Setup & Installation Instructions

### Prerequisites
- Node.js 18.x or 20.x+
- (Optional for external DB) MySQL 8.0+

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: (Optional) MySQL Database Setup
If connecting to an external MySQL server, import the provided schema:
```bash
mysql -u root -p < schema.sql
```
Configure your `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kampala_fresh_db
PORT=3000
```
*Note: The built-in Express server also includes an auto-seeded in-memory store matching `schema.sql`, allowing the application to run immediately in zero-dependency container environments!*

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 End-to-End Test Steps: Placing an Order

Follow these steps to test the complete user journey:

1. **Browse Products**:
   - On the homepage, click the **Staples** or **Vegetables** category chip.
   - Observe the 20 realistic products with Ugandan prices (e.g., *Fresh Matooke Cluster* at UGX 8,500, *Kabale Irish Potatoes* at UGX 4,500).

2. **Add to Basket & Verify Minimum Order Rule**:
   - Click **Add** on *Fresh Matooke* (UGX 8,500).
   - Open the basket by tapping the top right **Basket** button.
   - Note the progress bar stating: `Minimum order is UGX 20,000 (Add UGX 11,500 more)`.
   - Notice that the **Proceed to Checkout** button is disabled with helpful guidance.
   - Increase the quantity of Matooke to 2 (UGX 17,000) and add 1x *Red Salad Tomatoes* (UGX 4,000). Total is now UGX 21,000.
   - Notice the green checkmark: `✓ Minimum order of UGX 20,000 reached`.
   - Note the separate **Delivery Fee: UGX 3,000** and total **UGX 24,000**.

3. **Proceed to Checkout**:
   - Tap **Proceed to Checkout**.
   - Enter your name: `Sarah Namubiru`.
   - Enter Ugandan phone: `0772 123 456`.
   - Select Delivery Area: `Kololo` (or `Ntinda`).
   - Enter Address: `Acacia Avenue, Pine Court Flat 3`.
   - Select Preferred Delivery Slot: `Morning (8:00 AM - 12:00 PM)`.
   - Select Substitution: `Call me before substituting any produce`.
   - Tap **Continue to Payment**.

4. **Test Payment & Simulation**:
   - Choose **MTN Mobile Money**.
   - Tap **Authorize Mobile Money**.
   - Observe the **Payment Pending** spinner and simulated USSD PIN push screen.
   - **Test Error & Retry**: Click **Simulate Failed** to test failure handling.
   - Notice the clear error banner and click **Retry Mobile Money Payment** or **Switch to Pay on Delivery**.
   - Tap **Simulate Approval** to successfully complete the transaction.

5. **Live Order Tracking**:
   - You are immediately redirected to the **Order Tracking** screen showing your unique order number (e.g. `KF-8821`).
   - Observe the 4-stage stepper currently on **Order Received**.

6. **Admin Verification & Status Advancement**:
   - Click the **Admin** button in the top bar.
   - Enter password `kampala2026`.
   - Click the **Orders** tab to find the new order you just placed.
   - Change the dropdown status from `Received` ➔ `Packing` ➔ `Out for delivery` ➔ `Delivered`.
   - Switch back to the **Overview & Revenue** tab to see updated daily orders and total revenue in UGX.
   - Close Admin and re-open **Track Order** to confirm your order now displays the updated active stage!

7. **Test "Order on WhatsApp" Button**:
   - Add any item to the basket.
   - Click the floating **Order on WhatsApp** button in the bottom right corner.
   - Notice the generated pre-filled message formatted with your basket contents, UGX prices, and delivery terms.
