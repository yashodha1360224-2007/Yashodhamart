# YashodhaMart - Full-Stack E-Commerce Platform

YashodhaMart is a feature-complete, modern Indian full-stack e-commerce web application built using **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM** with SQLite/PostgreSQL, and custom **JWT HTTP-Only session authentication**.

---

## Features Overview

### Customer Storefront
- **Home Landing Page**: Dynamic promotional banner carousel, department cards, featured deals, new arrivals, best sellers, and trust badges.
- **Product Catalog**: Department-wise catalog with live search across product names, categories, and descriptions.
- **Multi-Filter & Multi-Sort**: Filter by Category, Price Range (Min/Max), Star Rating, Availability, and Discount percentage. Sort by Popularity, Newest, Price Low-High, Price High-Low, and Ratings.
- **Product Details Page**: High-resolution image gallery thumbnails, MRP vs discount pricing, stock limit checking, quantity picker, wishlist toggle, Buy Now, and verified customer review section.
- **Shopping Cart**: Real-time quantity controls bounded by stock limits, item subtotal calculation, free shipping threshold (> ₹500), and delivery charge breakdown.
- **Wishlist**: Quick add/remove, toggle, and one-click move from wishlist to shopping cart.
- **Saved Address Management**: Full Indian address fields (House/Building, Street, Area, City, State, PIN code) with field validations and default address toggle.
- **Multi-Step Checkout**: Stepper flow (1. Select Shipping Address -> 2. Select Payment Method: Cash on Delivery or Demo Online Payment -> 3. Order Receipt & Stock Deduction).
- **Order Tracking & Management**: Unique Order ID generation (`YM-ORD-XXXXXX`), order timeline pipeline (Pending, Confirmed, Packed, Shipped, Out for Delivery, Delivered), order receipt details, and one-click order cancellation with stock restoration.
- **Verified Buyer Reviews**: Customer star rating (1-5 stars) and review text submission restricted exclusively to buyers with delivered orders.

### Protected Admin Portal
- **Admin Authentication**: Separate secure Admin Login (`admin@yashodhamart.com`) and session isolation.
- **Dashboard Overview**: KPI cards for Total Revenue, Total Orders, Total Users, Total Products, Pending Orders, Delivered Orders, and Recent Orders summary.
- **Product Management**: Add new products with custom images, update pricing/stock/discounts/categories, toggle active/inactive listings, and delete products with confirmation.
- **Order Pipeline Control**: View all customer orders, search by order number/customer, filter by status, and update shipment statuses.
- **User Account Management**: View registered customer accounts, search users, track order counts, and activate/deactivate user accounts securely.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database & ORM**: Prisma ORM with SQLite (`prisma/dev.db`) / PostgreSQL
- **Authentication**: JWT signed with `jose` stored in HTTP-Only Session cookies + `bcryptjs` password hashing

---

## Environment Variables

The `.env` file contains:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="yashodha_mart_super_secret_jwt_key_2026_college_project_secure_session"
NODE_ENV="development"
```

---

## Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Database Schema & Seed Data
```bash
npx prisma db push
npx prisma db seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Login Credentials

### Demo Customer Account
- **Email**: `user@yashodhamart.com`
- **Password**: `User12345!`

### Demo Admin Account
- **Email**: `admin@yashodhamart.com`
- **Password**: `Admin12345!`
- **Admin Portal Link**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Testing Instructions

1. **User Authentication Flow**:
   - Register a new account at `/register` or login at `/login`.
   - Test invalid credentials or duplicate email registration.
2. **Catalog & Search Flow**:
   - Search for "Headphones", "Kurta", or "Laptop" at `/products`.
   - Filter by price range and sort by "Price: Low to High".
3. **Cart & Wishlist Flow**:
   - Add items to Wishlist at `/wishlist`.
   - Add items to Shopping Cart at `/cart` and update quantity.
4. **Checkout & Order Flow**:
   - Proceed to `/checkout`, select or add shipping address.
   - Choose Cash on Delivery or Demo Online Payment and click Place Order.
   - View order in My Orders at `/orders`.
5. **Admin Portal Flow**:
   - Log in at `/admin/login` using `admin@yashodhamart.com` / `Admin12345!`.
   - Review Dashboard metrics at `/admin/dashboard`.
   - Add/edit products at `/admin/products`.
   - Advance order status to "Shipped" or "Delivered" at `/admin/orders`.
## Live Demo

Visit Website: https://yashodhamart.onrender.com
