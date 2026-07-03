# Dhaka Founders 🇧🇩🚀

Dhaka Founders is a premium, modern, and highly interactive directory and connection platform designed for Bangladesh's tech builders. It serves as a central hub where innovators, investors, and founders showcase their startups, build professional profiles, and discover collaborator networks.

Built on **Next.js (App Router)**, **TypeScript**, **Supabase SSR**, and **Clerk**, the application delivers a premium dark-themed experience with fluid glassmorphism, responsive grids, and micro-animations.

---

## 🌟 Core Features

### 1. Interactive Startup Directory
*   **Live Search**: Real-time filtering of startups by name, description, category, or founder display name.
*   **Category Filter Chips**: Responsive selector buttons to filter startups by industry sectors (e.g., *FinTech*, *AgriTech*, *EdTech*, *Software*, *E-Commerce*).
*   **Builder Cards**: Modern hover-animated cards displaying startup taglines, category badges, website/portfolio links, and founder metadata.
*   **Direct Connect**: Highlighting founder names with direct links pointing to their public profile pages.

### 2. Multi-Startup Founder Dashboard
*   **Decoupled Relations**: DEC-level structural change allowing a single founder to list and manage multiple startups under one account.
*   **Startup CRUD Controls**: Create, edit, and delete listed startups directly from the dashboard via modal forms.
*   **Save Indicators**: Fluid theme-matched loader overlay blocking interactions during writes to provide real-time status feedback.

### 3. Sleek Interactive Avatar Uploader
*   **Visual Circle Picker**: An interactive, rounded profile picture widget in the editor with smooth hover states.
*   **Camera Overlay**: Hovering overlays a camera icon with "Upload" text.
*   **Live Preview**: Selecting a local image file instantly renders it inside the circle, showing the founder exactly what their avatar looks like before saving.
*   **10MB Limit Support**: Increased Next.js Server Actions payload limit to **15MB** (`experimental.serverActions.bodySizeLimit`) to support high-resolution file selections from modern phones.

### 4. Bidirectional Clerk Profile Syncing
*   **Local to Clerk Upload**: Choosing a local avatar file converts it to a binary Blob on the server, uploads it directly to Clerk via the Backend SDK, and saves Clerk's optimized public CDN image URL to Supabase.
*   **Clerk to Local Update**: If a user updates their profile picture through Clerk's direct interface (e.g., Clerk User Button), the app automatically detects the delta on fetch and updates the Supabase record.
*   **Clean Resets**: Clearing the avatar automatically deletes the custom picture on Clerk, resetting it to default initials.

### 5. Dynamic Public Profile Viewer (`/founder/[clerk_auth_key]`)
*   **Public URL Pages**: Dynamic routes showcasing a founder's bio, email address, LinkedIn, and portfolio link on the left-column card.
*   **Portfolio Grid**: Displays a grid of all the startups registered under their key on the right-column section.

### 6. Self-Service Account Deletion
*   **Settings Dialog**: Access account management next to profile editing controls.
*   **Double Confirmation Modal**: Requires typing `"DELETE"` in the input to trigger a clean account removal.
*   **Cascading Wipes**: Server actions completely delete user startups and founder profiles in Supabase, followed by deleting their auth credentials in Clerk.

### 7. Brand DNA & Design Language
*   **Typography**: Outfitted with *Inter* and *Outfit* fonts.
*   **Glassmorphic UI**: Translucent cards (`bg-surface-glass`), borders (`border-primary/10`), and backdrops (`backdrop-blur-2xl`) using custom HSL tailwinds.
*   **Centered Layouts**: Logo, navigation links (Home, Directory, Dashboard), and auth buttons are spaced using CSS Grid layouts centered across viewports.

### 8. Full Phone Screen Responsiveness
*   **Mobile Hamburg Drawer**: Navigation collapses on mobile viewports with a fluid menu slide.
*   **Adaptive Grids**: Grids dynamically drop columns on smaller phone screens.
*   **No Overflow**: Margin and padding thresholds optimized for standard `375px` to `414px` viewports.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 16 (App Router & Turbopack)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4 & Vanilla CSS
*   **Authentication**: Clerk (custom-designed dark theme)
*   **Database**: Supabase (PostgreSQL with custom RLS Policies)
*   **Icons**: Lucide React

---

## 📂 Project Architecture

```
├── app
│   ├── actions                 # Server Actions (CRUD, Syncing, Deletion)
│   │   └── startup.ts
│   ├── dashboard               # Private Founder Dashboard
│   │   ├── page.tsx
│   │   └── DashboardClient.tsx
│   ├── directory               # Searchable Startups Directory
│   │   ├── page.tsx
│   │   └── DirectoryClient.tsx
│   ├── founder                 # Dynamic Public Profiles
│   │   └── [clerk_auth_key]
│   │       └── page.tsx
│   ├── layout.tsx              # Global Theme Layout & Clerk Config
│   └── page.tsx                # Home Landing Page
├── components
│   └── Navbar.tsx              # Centered Navigation Component
├── utils
│   └── supabase
│       ├── client.ts           # Supabase Client SDK Instance
│       └── server.ts           # Supabase Server SDK Instance
└── next.config.ts              # Next.js Server Configurations (Body Size Limits)
```

---

## 🚀 Setup & Installation

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure environment variables (`.env.local`)
Create a `.env.local` file in the root directory and add:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the platform.

### 4. Build for production
```bash
npm run build
```
