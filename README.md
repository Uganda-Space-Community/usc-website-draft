# Uganda Space Community Platform

A professional institutional website for Uganda's space ecosystem — connecting researchers, students, engineers, policymakers, and organizations across the country. It is the national hub for space news, events, learning resources, community networking, and live sky data — all in one place.

## What the Platform Is For

The USC platform is the digital home of Uganda's space ecosystem. Anyone with an interest in space — from school students to policymakers — can use it to discover, learn, connect, and contribute.

| Audience | What they can do here |
|----------|------------------------|
| **Students & enthusiasts** | Follow launches and night-sky events (ISS flyovers over Kampala, eclipses, meteor showers), browse the knowledge base, join community events |
| **Researchers & academics** | Share and discover papers, datasets, and course material; connect with peers via member profiles, interests, and affiliations |
| **Engineers & startups** | Find programmes, projects, and opportunities; get their work seen by the national community |
| **Policymakers & agencies** | Track ecosystem activity through the events calendar, updates feed, and published policies |
| **Organizations** | Maintain a public profile, list events and programmes, and reach the community |
| **Community organizers** | Promote events on the calendar and share announcements on the updates feed |
| **Curators & admins** | Approve community submissions, manage content, moderate users, and audit changes |

### Key capabilities

- **Live space data** — NASA Astronomy Picture of the Day, upcoming global launches, space news (region-prioritized: Uganda first), ISS flyover predictions for Kampala, and curated night-sky events (eclipses, meteor showers, oppositions)
- **Events calendar** — month / week / year views covering community events, cosmic events, holidays, deadlines, launches, and night-sky observations, with category filters
- **Knowledge base** — curated papers, policies, tools, datasets, and guides
- **Updates feed** — community announcements and articles, opportunities, and world space news
- **Community directory** — member profiles with interests, affiliations, and connections; organization listings
- **Programmes & projects** — active ecosystem initiatives such as World Space Week
- **Community Q&A** — FAQ with upvoted answers and public question submission
- **Member dashboards** — profile management, content submission with a review workflow (Quill.js editor), and curator/admin moderation tools

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Static HTML, CSS, vanilla JavaScript |
| Backend | PHP 8.0+ (shared hosting compatible) |
| Database | MySQL (via cPanel or XAMPP) |
| Auth | PHP sessions + bcrypt password hashing |
| Rich Text | Quill.js (article content editor) |
| Hosting | Any cPanel-based shared hosting with `mod_rewrite` |

## File Structure

```
site/
├── .htaccess                 # Clean URL rewrites (removes .html, detail page slugs)
├── api/                      # PHP backend
│   ├── .htaccess             # Denies direct access to API directory
│   ├── config.php            # DB connection, CORS, auth helpers, session management
│   ├── auth.php              # Signup, login, logout, session check
│   ├── submissions.php       # Form submissions, voting, question submission
│   ├── content.php           # Read-only content endpoints (by type, by ID, stats)
│   ├── user.php              # Profile CRUD, password change, affiliations & connections
│   ├── admin.php             # Admin panel API (stats, review, user mgmt, content CRUD, settings)
│   ├── audit.php             # Audit log (list entries, create entries)
│   ├── upload.php            # File upload handler (images)
│   ├── space.php             # Space API proxy (APOD, launches, news, ISS passes, celestial)
│   ├── schema.sql            # Database schema (run in phpMyAdmin)
│   ├── seed.php              # Seed DB from content.json (run once)
│   └── seed-team.php         # Create team accounts + curator roles + authorship
├── cache/                    # File cache for space API responses (.gitkeep tracked only)
├── css/
│   ├── base.css              # Shared styles (nav, footer, buttons, dark mode, etc.)
│   └── dashboard.css         # Dashboard layout, sidebar, forms, tables, tags input
├── data/
│   ├── content.json          # Centralized content data (1858+ lines)
│   └── celestial-events.json # Curated night-sky events (eclipses, meteor showers, etc.)
├── img/                      # Images, emblem, uploads
│   ├── uploads/              # User-uploaded images
│   ├── emblem.png            # Site emblem (profile default avatar)
│   ├── hero-1.jpg            # Hero carousel images
│   ├── hero-2.jpg
│   └── hero-3.jpg            # Default fallback for failed images
├── js/
│   ├── api.js                # Fetch wrapper for all API calls
│   ├── auth.js               # Auth module (API + localStorage fallback, nav rendering)
│   ├── admin.js              # Legacy admin panel logic (still functional)
│   └── dashboard.js          # Unified dashboard (sidebar, routing, all section renderers)
├── dashboard.html            # Unified dashboard (profile, submissions, review, content, users, audit, settings)
├── admin.html                # Legacy admin panel (still functional, redirects to dashboard)
├── index.html                # Homepage
├── login.html                # Login / signup
├── community.html            # Members & organizations (32 orgs, 12 team members)
├── calendar.html             # Events calendar
├── launchpad.html            # Programs & projects
├── updates.html              # News, articles, opportunities
├── knowledge.html            # Knowledge base (10 resources)
├── faq.html                  # FAQ with community Q&A, answer voting
├── about.html                # About the platform
├── member.html               # Individual member profile (dynamic)
├── event.html                # Individual event detail (dynamic)
├── program.html              # Individual program detail (dynamic)
├── project.html              # Individual project detail (dynamic)
├── organization.html         # Individual organization detail (dynamic)
├── news.html                 # Individual news detail (dynamic)
├── opportunity.html          # Individual opportunity detail (dynamic)
├── terms.html                # Terms of use
├── privacy.html              # Privacy policy
└── code-of-conduct.html      # Community code of conduct
```

## Pages

| Page | Purpose |
|------|---------|
| `index.html` | Homepage — mission slideshow, featured events, launches, night-sky highlights, announcements, and world space news |
| `updates.html` | Updates feed — community announcements, articles, opportunities, and region-prioritized space news |
| `calendar.html` | Events calendar — community events, cosmic events, holidays, deadlines, launches, ISS flyovers, and night-sky events (month/week/year views + filters) |
| `launchpad.html` | Programmes & projects across the ecosystem |
| `knowledge.html` | Knowledge base — papers, policies, tools, datasets, guides + Astronomy Picture of the Day + Night Sky Guide (ISS flyovers & celestial events) |
| `community.html` | Community directory — member profiles and organizations |
| `faq.html` | Community Q&A with answer voting and public question submission |
| `about.html` | About the platform, challenges, and what USC does |
| `dashboard.html` | Unified member/curator/admin dashboard |
| `login.html` | Login / signup |
| `event.html` · `news.html` | Detail pages for events and news |
| `member.html` · `organization.html` | Detail pages for members and organizations |
| `program.html` · `project.html` · `opportunity.html` | Detail pages for programmes, projects, and opportunities |
| `terms.html` · `privacy.html` · `code-of-conduct.html` | Legal and community guidelines |

## Setup

### Prerequisites

- PHP 8.0+ (XAMPP recommended for local dev)
- MySQL (via XAMPP)
- A local web server (Apache via XAMPP with `mod_rewrite` enabled)

### 1. Local Development (XAMPP)

1. Start **Apache** and **MySQL** from the XAMPP Control Panel
2. Create a junction from `htdocs` so the site is accessible:

```cmd
mklink /J "C:\xampp\htdocs\usc" "M:\Dev\projects\New folder\uas\usc\site"
```

3. Create the database and seed data:

```cmd
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS usc_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
"C:\xampp\mysql\bin\mysql.exe" -u root usc_database < site\api\schema.sql
"C:\xampp\php\php.exe" site\api\seed.php
"C:\xampp\php\php.exe" site\api\seed-team.php
```

4. Open **http://localhost/usc/** in your browser

### Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@space.org.ug | admin123 | admin |
| ronnie@space.org.ug | space2026 | curator |
| zoora@space.org.ug | space2026 | curator |
| halimah@space.org.ug | space2026 | curator |
| anguzu@space.org.ug | space2026 | curator |
| navneet@space.org.ug | space2026 | curator |
| twesigye@space.org.ug | space2026 | curator |
| nabbaale@space.org.ug | space2026 | member |
| simon@space.org.ug | space2026 | member |
| samuel@space.org.ug | space2026 | member |
| malcom@space.org.ug | space2026 | member |
| bwengye@space.org.ug | space2026 | member |
| ayebazibwe@space.org.ug | space2026 | member |

> **Note:** The API credentials in `site/api/config.php` default to XAMPP's root user with no password. Update them for production.

### 2. Production Deployment (cPanel)

1. In cPanel, go to **MySQL Databases** and create a database + user
2. Open **phpMyAdmin**, select your database
3. Import `site/api/schema.sql`
4. Run `php site/api/seed.php` to seed content (or skip to start empty)
5. Edit `site/api/config.php` with your database credentials
6. Upload the `site/` directory contents to `public_html/`
7. Ensure `mod_rewrite` is enabled on Apache
8. Create an admin user:

```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@space.org.ug', '$2y$10$...hash...', 'admin');
```

## Clean URLs

All pages use clean URLs via `.htaccess` rewrites:

| URL | Maps To |
|-----|---------|
| `/usc/` | `index.html` |
| `/usc/community` | `community.html` |
| `/usc/calendar` | `calendar.html` |
| `/usc/events/slug` | `event.html?id=slug` |
| `/usc/news/slug` | `news.html?id=slug` |
| `/usc/members/slug` | `member.html?id=slug` |
| `/usc/organizations/slug` | `organization.html?id=slug` |
| `/usc/programs/slug` | `program.html?id=slug` |
| `/usc/projects/slug` | `project.html?id=slug` |
| `/usc/opportunities/slug` | `opportunity.html?id=slug` |

Old `.html` URLs automatically 301 redirect to clean URLs.

## API Endpoints

### Auth (`api/auth.php`)

| Method | Action | Auth | Description |
|--------|--------|------|-------------|
| POST | `signup` | No | Create account (name, email, password) |
| POST | `login` | No | Login (email, password) |
| POST | `logout` | No | Destroy session |
| GET | `check` | No | Return current user or null |

### Submissions (`api/submissions.php`)

| Method | Action | Auth | Description |
|--------|--------|------|-------------|
| POST | `submit` | Yes | Submit any content type |
| POST | `question` | No | Submit FAQ question |
| POST | `vote` | Yes | Vote on FAQ answer |
| GET | `mine` | Yes | List user's submissions |
| POST | `delete` | Yes | Delete own pending submission |

### Content (`api/content.php`)

| Method | Action | Auth | Description |
|--------|--------|------|-------------|
| GET | `?type=events` | No | Approved events |
| GET | `?type=programs` | No | Approved programs |
| GET | `?type=organizations` | No | Approved organizations |
| GET | `?id=slug` | No | Get single item by slug |
| GET | `?action=faqs` | No | Approved FAQ questions |
| GET | `?action=stats` | No | Platform statistics |

### User (`api/user.php`)

| Method | Action | Auth | Description |
|--------|--------|------|-------------|
| GET | `?action=profile` | Yes | Get own profile (incl. affiliations, connections) |
| POST | `action=update-profile` | Yes | Update profile fields, affiliations, connections |
| POST | `action=change-password` | Yes | Change password (requires current password) |
| GET | `?action=my-submissions` | Yes | List own submissions with filtering |

### Admin (`api/admin.php`)

| Method | Action | Auth | Description |
|--------|--------|------|-------------|
| GET | `?action=stats` | curator+ | Dashboard stats (counts, recent activity) |
| GET | `?action=list` | curator+ | List submissions (filter by status, type) |
| GET | `?action=get` | curator+ | Get single record by ID |
| POST | `action=review` | curator+ | Approve/reject a submission |
| POST | `action=bulk-review` | curator+ | Bulk approve/reject |
| POST | `action=create` | curator+ | Create new content record |
| POST | `action=update` | curator+ | Update content record |
| POST | `action=delete` | curator+ | Delete content record |
| GET | `?action=users` | admin | List all users |
| POST | `action=update-role` | admin | Change user role |
| POST | `action=toggle-status` | admin | Suspend/unsuspend user |
| GET | `?action=settings` | admin | Get site settings |
| POST | `action=settings` | admin | Update site settings |

### Audit Log (`api/audit.php`)

| Method | Action | Auth | Description |
|--------|--------|------|-------------|
| GET | `?action=list` | curator+ | List audit entries (filter by action_type, user_id) |
| POST | `action=log` | curator+ | Create audit entry |

### Upload (`api/upload.php`)

| Method | Auth | Description |
|--------|------|-------------|
| POST | Yes | Upload image file, returns `{ url: "img/uploads/..." }` |

### Space API (`api/space.php`)

Public proxy with file-based caching (cached JSON in `site/cache/`). Clean URL: `/api/space?action=...` (`.htaccess` rewrite).

| Action | Source | Cache | Description |
|--------|--------|-------|-------------|
| `apod` | NASA APOD | 12h | Astronomy Picture of the Day; optional `&date=YYYY-MM-DD` |
| `launches` | Launch Library 2 | 3h | Upcoming 25 launches, region-sorted (Uganda > E. Africa > Africa > Global) |
| `news` | Spaceflight News API | 15min | Space news, region-sorted |
| `iss` | Celestrak TLE + J2 propagator | 1h | Upcoming ISS flyover passes over Kampala (30s sampling, 8-day window, ≥10° elevation) |
| `celestial` | `site/data/celestial-events.json` | — | Curated night-sky events (eclipses, meteor showers, oppositions) — future only |

Set `NASA_API_KEY` env var (or edit `api/config.php`) for higher APOD rate limits.

## Dashboard Architecture

The unified dashboard (`dashboard.html`) replaces the old separate admin panel:

| Section | Access | Description |
|---------|--------|-------------|
| `#profile` | All members | Edit profile (name, bio, interests tags, affiliations, connections, social links) + change password |
| `#submissions` | All members | View/filter/delete own submissions |
| `#submit` | All members | Submit new content (Quill.js editor for articles) |
| `#review` | Curator+ | Approve/reject pending submissions with notes |
| `#content` | Curator+ | Browse/edit all content records by type |
| `#users` | Admin | User management (roles, suspend/unsuspend) |
| `#audit` | Curator+ | Audit log with action filtering |
| `#settings` | Admin | Site settings (tagline, contact info, social URLs) |

## Roles

| Role | Permissions |
|------|------------|
| **member** | Submit content, vote on FAQ, edit own profile (interests, affiliations, connections) |
| **curator** | Review/approve/reject submissions, manage content, view audit log |
| **admin** | Full access: manage users, roles, settings, all content |

## Database Schema

5 tables:

- **users** — id, name, email, password, role, bio, interests, affiliations (JSON), connections (JSON), location, avatar_url, website, twitter, linkedin, status, last_login, created_at
- **submissions** — id, type, user_id, payload (JSON), status, reviewed_by, review_note, created_at, reviewed_at
- **faq_votes** — user_id, answer_key, value (upvote/downvote)
- **audit_log** — id, user_id, user_name, action_type, target_type, target_id, details, created_at

Performance indexes on submissions (type+status, user_id, created_at), audit_log (user_id, action_type, created_at), users (role, status).

## Design System

- **Font**: Inter (300, 400, 500, 600, 700)
- **Colors**: Gold (#B8953F), Red (#D94F3D), Emerald (#1F8A5B)
- **Dark mode**: Toggle with localStorage persistence
- **Responsive**: Mobile-first, breakpoints at 640px and 900px
- **Rich text**: Quill.js Snow theme for article content
- **Images**: `hero-3.jpg` fallback for failed content images, `emblem.png` for profile avatars

## License

© 2026 Uganda Space Community. All rights reserved.
