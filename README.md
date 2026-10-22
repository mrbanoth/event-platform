<div align="center">
  <br />
  <h1 align="center"><b>Tribely — Modern Event Management & Ticketing Platform</b></h1>
  <p align="center">
    A full-stack, responsive community event and ticketing application built with Next.js 14, TypeScript, Tailwind CSS, Stripe, Clerk, and MongoDB.
  </p>
  <br />

  <div>
    <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
    <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
  </div>
</div>

<br />

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Folder Structure](#-architecture--folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Models](#-database-models)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Evently** is a production-ready web platform for creating, managing, discovering, and booking events worldwide. Whether hosting a paid conference, community workshop, or free meetup, Evently provides an end-to-end ticketing experience with secure Stripe checkout, automated webhook order fulfillment, dynamic category exploration, and real-time search.

---

## 🚀 Key Features

- **🔐 User Authentication**: Seamless and secure user signup/login powered by Clerk, supporting social sign-ins and session management.
- **📅 Full Event Lifecycle (CRUD)**:
  - **Create**: Add new events with start/end dates, location/online options, category, custom description, pricing, and banners.
  - **Read**: Explore detailed event landing pages with rich descriptions, organizer profiles, and related event suggestions.
  - **Update**: Organizers can update event details in real-time.
  - **Delete**: Quick and safe deletion for organizers with confirmation modals.
- **💳 Integrated Stripe Ticketing**:
  - Secure Stripe Checkout sessions for paid events.
  - Support for free RSVP registrations.
  - Webhook-driven order tracking with transaction IDs and buyer details.
- **🔍 Search & Filter**:
  - Real-time search query handling.
  - Dynamic category selector with the ability to add new categories on the fly.
  - Clean URL query parameter synchronization.
- **🖼️ Media Storage**: Direct-to-cloud image uploads powered by UploadThing.
- **📊 User Dashboard & Profile**:
  - Track registered tickets and view transaction history.
  - Manage all events created by the user in one organized place.
- **📈 Organizer Order Insights**: View buyer lists, order timestamps, and revenue per event.
- **📱 Fully Responsive Design**: Mobile-first interface with fluid navigation and custom modal drawers.

---

## 🛠️ Tech Stack

- **Frontend & Backend**: [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **File Uploads**: [UploadThing](https://uploadthing.com/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 📁 Architecture & Folder Structure

```
event-platform/
├── app/
│   ├── (auth)/                 # Clerk authentication routes (sign-in, sign-up)
│   ├── (root)/                 # Core application routes
│   │   ├── events/             # Event view, create, and update pages
│   │   ├── orders/             # Order and ticket tracking
│   │   ├── profile/            # User profile (organized events & tickets)
│   │   └── page.tsx            # Main landing page & event catalog
│   └── api/
│       ├── uploadthing/        # UploadThing file upload endpoints
│       └── webhook/
│           ├── clerk/          # Clerk user sync webhook
│           └── stripe/         # Stripe checkout webhook
├── components/
│   ├── shared/                 # Reusable domain components (EventForm, Card, Search, etc.)
│   └── ui/                     # Primitives from shadcn/ui
├── constants/                  # Navigation links and static defaults
├── lib/
│   ├── actions/                # Next.js Server Actions (event, user, category, order)
│   ├── database/               # Mongoose connection & schema models
│   ├── uploadthing.ts          # UploadThing helpers
│   ├── utils.ts                # Date formatting, price calculation, class merging
│   └── validator.ts            # Zod event form schemas
└── public/
    └── assets/                 # Icons, illustrations, and logos
```

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mrbanoth/event-platform.git
   cd event-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys in `.env.local` (see below).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Next.js Server
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/evently?retryWrites=true&w=majority

# UploadThing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🗄️ Database Models

- **User**: Synchronized with Clerk accounts (ID, name, email, avatar).
- **Event**: Contains title, description, location, timing, image, pricing, category, and organizer reference.
- **Category**: Dynamic taxonomy tags for classifying events.
- **Order**: Records ticket purchases, linking Stripe sessions, events, and buyers.

---

## 📄 License

This project is licensed under the MIT License — feel free to use and adapt it for your own projects.
