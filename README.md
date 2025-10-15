# My Blog

My Blog is a multi-tenant blogging platform built with Next.js. It combines a modern collaborative editing experience, fine-grained organization-level access control, and social engagement features such as likes, favorites, and threaded comments.

## Feature Highlights

- **Multi-tenant roles** – Global administrators plus per-organization roles (Owner, Admin, Editor, Author, Contributor, Viewer) control who can publish or manage content.
- **Rich content authoring** – TipTap-powered editor with images, code blocks, formatting, and sanitization.
- **Engagement layer** – Readers can comment, like, and favorite posts; view counts are tracked per post and per author.
- **Dynamic tagging** – Hybrid system of curated suggestions and custom tags with server-side validation.
- **Dark-mode aware UI** – Theme toggling with color tokens and Tailwind-based styling.

## Technology Stack

| Layer              | Technology                                                        |
| ------------------ | ----------------------------------------------------------------- |
| Web Framework      | [Next.js 15](https://nextjs.org/) (App Router)                    |
| UI                 | React 19, Tailwind CSS 4, shadcn/ui primitives, Heroicons, Lucide |
| Editor             | TipTap (with highlight.js, lowlight)                              |
| Auth               | NextAuth.js with Prisma adapter, Credentials + Google providers   |
| Data               | Prisma ORM, PostgreSQL                                            |
| Validation & Utils | Zod, sanitize-html, node-cron                                     |

## System Architecture

```mermaid
graph TD
    A[Browser] -->|SSR/CSR| B[Next.js App Router]
    B -->|ORM Queries| C[(PostgreSQL)]
    B -->|Authentication| D[NextAuth]
    D -->|Prisma Adapter| C
    B -->|Rich Text APIs| E[TipTap Extensions]
    B -->|Background Jobs| F[node-cron Tasks]
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL instance (local Docker or managed)

### Environment variables

Create `.env.local` and provide at least:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
NEXTAUTH_SECRET="your-64-char-secret"
GOOGLE_CLIENT_ID="optional-oauth"
GOOGLE_CLIENT_SECRET="optional-oauth"
```

> Update `.env.example` and re-seed Prisma when new secrets are introduced.

### Install & run locally

```bash
# Install dependencies
pnpm install

# Apply database schema and generate the Prisma client
pnpm prisma migrate dev

# (Optional) seed demo accounts or content
node scripts/create-user.js

# Start the dev server (http://localhost:3000)
pnpm dev
```

### Useful scripts

| Command                   | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `pnpm dev`                | Run the Turbopack development server                |
| `pnpm build`              | Produce a production bundle                         |
| `pnpm start`              | Serve the production build                          |
| `pnpm lint`               | Run ESLint (Next.js core web vitals, zero warnings) |
| `pnpm lint:fix`           | Run ESLint with auto-fix enabled                    |
| `pnpm format`             | Check formatting with Prettier                      |
| `pnpm format:write`       | Apply Prettier formatting to the codebase           |
| `pnpm prisma migrate dev` | Apply migrations and regenerate Prisma client       |

## Project Structure

```
.
├─ app/
│  ├─ (content)/posts/              # Server components for post CRUD flows
│  │  ├─ create/page.tsx            # Post creation compound form
│  │  ├─ [id]/page.tsx              # Post detail (view, comments, access control)
│  │  └─ [id]/edit/page.tsx         # Post editing entry point
│  ├─ (content)/profile/            # Author profile dashboard
│  ├─ api/                          # Route handlers (RESTful endpoints)
│  │  ├─ posts/list/route.ts        # Post listing, creation, update, deletion
│  │  ├─ posts/[id]/like/route.ts   # Like/unlike logic
│  │  ├─ comments/route.ts          # Comment CRUD endpoints
│  │  ├─ tags/route.ts              # Tag catalogue and creation
│  │  └─ organizations/route.ts     # Organization membership queries
│  ├─ lib/context/ThemeWrapper.tsx  # Next-themes provider
│  └─ layout.tsx                    # Root layout (fonts, global providers)
├─ components/ui/                   # Reusable UI primitives from shadcn/ui
├─ lib/
│  ├─ auth.ts                       # NextAuth configuration
│  ├─ permissions.ts                # Role & permission helpers
│  ├─ prisma.ts                     # Prisma client singleton
│  ├─ sanitizeHtml.ts               # TipTap sanitization wrapper
│  ├─ schedulePublisher.ts          # node-cron scheduled publisher
│  └─ tagRules.ts                   # Tag constants & validation limits
├─ prisma/
│  ├─ schema.prisma                 # Data model (users, posts, orgs, tags, comments)
│  └─ migrations/                   # Generated migration history
├─ scripts/
│  └─ create-user.js                # Utility to seed a demo user
├─ types/
│  ├─ post.ts                       # Shared post/tag type definitions
│  ├─ organization.ts               # Organization membership contracts
│  └─ user.ts                       # Cross-layer user interfaces
├─ tailwind.config.ts               # Tailwind (v4) configuration
└─ eslint.config.mjs                # Project linting rules
```

> The `app/ui/` subtree co-locates feature-specific client components (e.g., `PostContent`, `CommentSection`, `PostForm`) alongside their server routes.

## Development Notes

- Always run `pnpm prisma migrate dev` after changing `prisma/schema.prisma` and keep migrations committed.
- Update `lib/permissions.ts` when introducing new role types or adjusting access policies.
- Document manual QA steps for PRs until automated tests are introduced.

## License

This project is private; all rights reserved.
