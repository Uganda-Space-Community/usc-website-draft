# Uganda Space Community Platform

A professional institutional website for Uganda's space ecosystem — connecting researchers, students, engineers, policymakers, and organizations across the country.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Static HTML, CSS, vanilla JavaScript |
| Backend | PHP (shared hosting compatible) |
| Database | MySQL (via cPanel) |
| Auth | PHP sessions + bcrypt password hashing |
| Hosting | Any cPanel-based shared hosting |

## File Structure

```
site/
├── api/                    # PHP backend
│   ├── config.php          # DB connection, CORS, auth helpers
│   ├── auth.php            # Signup, login, logout, session check
│   ├── submissions.php     # Form submissions, voting
│   ├── content.php         # Read-only content endpoints
│   ├── user.php            # Profile CRUD, password change
│   ├── admin.php           # Admin panel API (stats, review, user mgmt)
│   ├── upload.php          # File upload handler
│   ├── schema.sql          # Database schema (run in phpMyAdmin)
│   ├── seed.php            # Seed DB from content.json (run once)
│   └── seed-team.php       # Create team accounts + curator roles + authorship
├── css/
│   └── base.css            # Shared styles (nav, footer, buttons, etc.)
├── data/
│   └── content.json        # Static content data
├── img/                    # Images and emblem
├── js/
│   ├── api.js              # Fetch wrapper for API calls
│   ├── auth.js             # Auth module (API + localStorage fallback)
│   └── admin.js            # Admin panel logic
├── admin.html              # Admin panel
├── dashboard.html          # User dashboard (profile, submissions)
├── index.html              # Homepage
├── login.html              # Login / signup
├── community.html          # Members & organizations
├── calendar.html           # Events calendar
├── launchpad.html          # Programs & projects
├── updates.html            # News, articles, opportunities
├── knowledge.html          # Knowledge base
├── faq.html                # FAQ with community Q&A
├── about.html              # About the platform
├── member.html             # Individual member profile
├── event.html              # Individual event detail
├── program.html            # Individual program detail
├── project.html            # Individual project detail
├── organization.html       # Individual organization detail
├── news.html               # Individual news detail
├── opportunity.html        # Individual opportunity detail
├── terms.html              # Terms of use
├── privacy.html            # Privacy policy
└── code-of-conduct.html    # Community code of conduct
```

## Setup

### Prerequisites

- PHP 8.0+ (XAMPP recommended for local dev)
- MySQL (via XAMPP)
- A local web server (Apache via XAMPP)

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
7. Create an admin user:

```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@space.org.ug', '$2y$10$...hash...', 'admin');
```

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

### Content (`api/content.php`)

| Method | Action | Auth | Description |
|--------|--------|------|-------------|
| GET | `events` | No | Approved events |
| GET | `programs` | No | Approved programs |
| GET | `organizations` | No | Approved organizations |
| GET | `faqs` | No | Approved FAQ questions |
| GET | `stats` | No | Platform statistics |

## Roles

| Role | Permissions |
|------|------------|
| **member** | Submit content, vote on FAQ, edit own profile |
| **curator** | Review and approve/reject submissions |
| **admin** | Full access: manage users, roles, and all content |

## Design System

- **Font**: Inter (300, 400, 500, 600, 700)
- **Colors**: Gold (#B8953F), Red (#D94F3D), Emerald (#1F8A5B)
- **Dark mode**: Toggle with localStorage persistence
- **Responsive**: Mobile-first, breakpoints at 640px and 900px

## License

© 2026 Uganda Space Community. All rights reserved.
