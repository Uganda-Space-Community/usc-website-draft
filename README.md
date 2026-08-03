# Uganda Space Community Platform

A professional institutional website for Uganda's space ecosystem — connecting researchers, students, engineers, policymakers, and organizations across the country.

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
│   ├── schema.sql            # Database schema (run in phpMyAdmin)
│   ├── seed.php              # Seed DB from content.json (run once)
│   └── seed-team.php         # Create team accounts + curator roles + authorship
├── css/
│   ├── base.css              # Shared styles (nav, footer, buttons, dark mode, etc.)
│   └── dashboard.css         # Dashboard layout, sidebar, forms, tables, tags input
├── data/
│   └── content.json          # Centralized content data (1858+ lines)
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
| ronnie@spacejunkies.ug | space2026 | curator |
| zoora@stellarview.ug | space2026 | curator |
| halimah@aerobuddies.ug | space2026 | curator |
| raymond@ktaadvocates.ug | space2026 | curator |
| navneet@nileorbitals.ug | space2026 | curator |
| duncan@noasquest.ug | space2026 | curator |
| grace.nabbaale@mak.ac.ug | space2026 | member |
| simon@hiaafrica.org | space2026 | member |
| samuel@uas.ug | space2026 | member |
| malcom@uas.ug | space2026 | member |
| cosmas@uas.ug | space2026 | member |
| brinton@stellarview.ug | space2026 | member |

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
