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
│   └── schema.sql          # Database schema (run in phpMyAdmin)
├── css/
│   └── base.css            # Shared styles (nav, footer, buttons, etc.)
├── data/
│   └── content.json        # Static content data
├── img/                    # Images and emblem
├── js/
│   ├── api.js              # Fetch wrapper for API calls
│   └── auth.js             # Auth module (API + localStorage fallback)
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

### 1. Database

1. In cPanel, go to **MySQL Databases** and create a database + user
2. Open **phpMyAdmin**, select your database
3. Import `site/api/schema.sql`

### 2. API Configuration

Edit `site/api/config.php` with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_db_name');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_password');
```

### 3. Deploy

Upload the `site/` directory contents to `public_html/` on your cPanel hosting.

### 4. Create Admin User

After deployment, create an admin user via phpMyAdmin:

```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@space.org.ug', '$2y$10$...hash...', 'admin');
```

Or use the signup form and update the role manually:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@space.org.ug';
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
