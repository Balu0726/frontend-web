# FARMER CONNECT

FARMER CONNECT is a farmer-friendly React + Vite web application for direct agricultural trade. Farmers can list products and track sales, while buyers can discover produce and place orders without unnecessary middlemen.

## College Review 2 Requirements

### Admin module

- Admin login
- Admin dashboard with user, product and order totals
- View and manage all registered farmers and buyers
- View and manage all agricultural products
- View all orders and update order status

### User module

#### Farmer

- Farmer signup and login
- Farmer dashboard
- Add products with name, category, price, quantity, description and location
- View, edit and delete own products
- View received orders and total sales

#### Buyer

- Buyer signup and login
- Buyer dashboard
- Browse, search and filter products
- View product details, farmer, location, price and quantity
- Place orders
- View order history

## Local Storage authentication notice

This project uses browser Local Storage because it is a backend-free academic demonstration. It is **not production-level security**. A production system must use a secure backend, hashed passwords, server-side authorization and a database.

The following Local Storage keys are used consistently:

- `farmer_connect_users`
- `farmer_connect_products`
- `farmer_connect_orders`
- `farmer_connect_session`

## Default Admin Credentials

```text
Email: admin@agriculture.com
Password: Admin@123
```

The admin account is created automatically the first time the app opens.

## Project Structure

```text
.
├── src/
│   └── main.jsx       # React app, auth, role checks and dashboard features
├── styles.css         # Responsive green agricultural theme
├── index.html         # Vite HTML entry
├── vite.config.js     # Vite configuration
├── vercel.json        # SPA rewrite for Vercel refreshes
├── package.json       # Scripts and dependencies
└── app.js             # Preserved Review 1 reference implementation
```

## Run the project

Install Node.js 18 or newer, then run:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

## Build and preview

```bash
npm run build
npm run preview
```

## Upload to GitHub

Do not upload `node_modules`. From the project folder:

```bash
git init
git add .
git commit -m "Build FARMER CONNECT agriculture platform"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repository>.git
git push -u origin main
```

If this folder already has a GitHub remote, use `git remote -v` to check it and push with `git push`.

## Deploy to Vercel

The exact Vercel CLI commands are:

```bash
npm install -g vercel
vercel login
vercel
```

When prompted, choose the project folder, confirm the Vite build settings, and accept the defaults. The included `vercel.json` sends dashboard refresh requests to `index.html`, preventing SPA 404 errors.

This project has no backend, database, Firebase, paid API, or external service.

## Project review answers

1. **Why React and Vite?** React organizes the app into reusable components and Vite provides fast development and production builds.
2. **How are roles separated?** Signup saves either `farmer` or `buyer`; the admin is seeded separately. The app checks the session role before rendering each dashboard.
3. **How is data stored?** Users, products, orders and the active session are serialized into Local Storage using reusable `read` and `write` helpers.
4. **How does a farmer add a product?** The farmer opens My products, fills the product form, and the product is persisted to Local Storage.
5. **How does a buyer order?** The buyer searches or filters products, opens View details, and selects Place order. The order and stock change are saved locally.
6. **Is Local Storage secure?** No. It is only suitable for this academic demonstration; it must not be used for production authentication.
