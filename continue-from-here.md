# Continuation Guide — Uganda Space Community (USC)

## Current Status Overview
All major architectural overhauls and site refinements requested have been implemented, tested, and verified.

---

## What Was Completed in This Session

### 1. Unified Dashboard Architecture
- Replaced the standalone `admin.html` with a unified sidebar dashboard in `site/dashboard.html`.
- Formatted and organized layout via `site/css/dashboard.css` and logic in `site/js/dashboard.js`.
- Hash-based routing (`#profile`, `#submissions`, `#submit`, `#review`, `#content`, `#users`, `#audit`, `#settings`).
- Role-limited navigation sidebar dynamically rendered based on user role (`member`, `curator`, `admin`).
- Added a "Back to Site" navigation link in the dashboard sidebar.

### 2. Clean URLs & `.htaccess` Rewrites
- Clean URL rewrites configured in `site/.htaccess`:
  - `/events/slug` $\rightarrow$ `event.html?id=slug`
  - `/news/slug` $\rightarrow$ `news.html?id=slug`
  - `/members/slug` $\rightarrow$ `member.html?id=slug`
  - `/organizations/slug` $\rightarrow$ `organization.html?id=slug`
  - `/programs/slug` $\rightarrow$ `program.html?id=slug`
  - `/projects/slug` $\rightarrow$ `project.html?id=slug`
  - `/opportunities/slug` $\rightarrow$ `opportunity.html?id=slug`
- Site-wide `.html` extension removal (301 redirects and internal rewrites for `/community`, `/calendar`, `/updates`, etc.).
- Detail pages updated with `<base href="/usc/">` and path-based slug extraction (`getSlug()`).

### 3. Audit Logging
- Created `site/api/audit.php` with GET (`action=list`) and POST (`action=log`) actions.
- Appended `audit_log` table definition to `site/api/schema.sql` and executed `ALTER TABLE`/`CREATE TABLE` on MySQL database.
- Integrated audit logging into `site/api/admin.php` for reviews, bulk reviews, role updates, status toggles, and deletes.
- Built full Audit Log UI in dashboard under `#audit` with action filtering.

### 4. Quill.js Rich Text Composer
- Integrated Quill.js CDN in `dashboard.html`.
- Updated submission and content manager forms in `js/dashboard.js` to render Quill editors for article content.
- Added dark mode CSS support for Quill editor toolbar and content container in `dashboard.css`.

### 5. Content Cross-References
- Enriched `site/data/content.json` with `related`, `organization`, and `programs` fields connecting related content items.
- Updated `event.html`, `organization.html`, and `program.html` detail templates to render "Related Programs", "Hosted By", and "Our Events" cards dynamically.

### 6. Image Fallbacks & Double Extension Fixes
- Corrected double-extension reference in `data/content.json` (`wsw-2026-save-the-date.png.jpg` $\rightarrow$ `.png`).
- Added `onerror` fallbacks across detail pages: `img/hero-3.jpg` for content images and `img/emblem.png` for user profile avatars.

### 7. User Profile Enhancements
- Added Tag-input for user interests with autofill suggestions in dashboard profile tab.
- Added dynamic Affiliation builder (`<organization, acronym, role>`) and Connection builder (`<url, type>`).
- Updated `users` table schema in MySQL and `site/api/schema.sql` with `affiliations` (JSON) and `connections` (JSON) columns.
- Updated `site/api/user.php` to handle saving and loading profile affiliations and connections.

### 8. FAQ Enhancements
- Added public question submission form in `site/faq.html` calling `USC_API.submitQuestion()`.
- Added answer submission and upvote/downvote UI per FAQ item in `site/faq.html`.

---

## Local Development & Setup

- **XAMPP Path**: `M:\Dev\xampp`
- **Root URL**: `http://localhost/usc/`
- **Database**: `usc_database` on XAMPP MySQL (Host: `127.0.0.1`, User: `root`, Password: ``)
- **Key Accounts**:
  - Admin: `admin@space.org.ug` / `admin123`
  - Curators & Members: `space2026` password (e.g. `ronnie@spacejunkies.ug`, `zoora@stellarview.ug`)

---

## Next Steps / Notes for Future Developers
- Ensure XAMPP Apache `mod_rewrite` module is enabled for `.htaccess` clean URLs.
- Content edits made via dashboard Content Manager automatically write to database or API endpoints.



###Pending/Cut-ff Instructions
Enrich the user profile and submission forms in the USC dashboard at M:\Dev\projects\New folder\uas\usc\site\.

## What to do

### 1. Update `js/dashboard.js` — Profile section enrichments

Read `js/dashboard.js` and find the `renderProfile` function. Make these changes:

**A. Interests field** — Change the interests field from a plain text input to a tag-style input with autofill. Replace the existing interests fieldGroup call with:

```javascript
html += '<div class="dash-admin-form-group dash-admin-form-full">';
html += '<label>Interests</label>';
html += '<div class="dash-tags-input" id="dash-tags-interests">';
html += '<div class="dash-tags-list" id="interests-tags"></div>';
html += '<input type="text" id="field-interests-input" placeholder="Type to add interests..." class="dash-input" style="flex:1;min-width:120px;border:none;box-shadow:none">';
html += '</div>';
html += '<small>Press Enter or comma to add. Suggestions: Astronomy, Satellite Tech, Earth Observation, STEM Education, Policy, Rocketry, Data Science</small>';
html += '</div>';
```

After the profile form is rendered (after `el.innerHTML = html;`), add initialization code:

```javascript
// Init interests tags
var interestsInput = document.getElementById('field-interests-input');
var interestsTags = document.getElementById('interests-tags');
var interests = (u.interests || '').split(',').map(function(s){return s.trim()}).filter(Boolean);

function renderInterestsTags() {
  interestsTags.innerHTML = interests.map(function(t, i) {
    return '<span class="dash-tag">' + esc(t) + ' <button type="button" class="dash-tag-remove" data-idx="' + i + '">&times;</button></span>';
  }).join('');
  document.getElementById('field-interests').value = interests.join(',');
  interestsTags.querySelectorAll('.dash-tag-remove').forEach(function(btn) {
    btn.addEventListener('click', function() {
      interests.splice(parseInt(btn.dataset.idx), 1);
      renderInterestsTags();
    });
  });
}
renderInterestsTags();

var SUGGESTIONS = ['Astronomy','Satellite Tech','Earth Observation','STEM Education','Policy','Rocketry','Data Science','Remote Sensing','GIS','Astrophysics','CubeSats','Space Law','Climate Science','AI/ML','IoT'];
if (interestsInput) {
  interestsInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      var val = this.value.replace(/,/g,'').trim();
      if (val && interests.indexOf(val) === -1) { interests.push(val); renderInterestsTags(); }
      this.value = '';
    }
  });
}
```

**B. Affiliations section** — Add a new section after the password section. Add this HTML in the renderProfile function, after the password section:

```javascript
html += '<div class="dash-section">';
html += '<div class="dash-section-title">' + icon('users', 18) + ' Affiliations</div>';
html += '<div id="dash-affiliations-list" class="dash-sub-grid"></div>';
html += '<button type="button" class="dash-btn dash-btn--outline dash-btn--sm" id="add-affiliation-btn" style="margin-top:12px">' + icon('plus', 14) + ' Add Affiliation</button>';
html += '</div>';
```

After the form renders, add:

```javascript
// Init affiliations
var affList = document.getElementById('dash-affiliations-list');
var affiliations = u.affiliations || [];

function renderAffiliations() {
  if (!affiliations.length) {
    affiliations = [{name:'',acronym:'',role:''}]; // start with one empty
  }
  affList.innerHTML = affiliations.map(function(a, i) {
    return '<div class="dash-sub-card" style="padding:16px">' +
      '<div class="dash-admin-form-grid">' +
      '<div class="dash-admin-form-group"><label>Organization</label><input type="text" class="dash-aff-name" data-idx="' + i + '" value="' + esc(a.name) + '" placeholder="e.g. Uganda Space Agency"></div>' +
      '<div class="dash-admin-form-group"><label>Acronym</label><input type="text" class="dash-aff-acronym" data-idx="' + i + '" value="' + esc(a.acronym) + '" placeholder="e.g. USA"></div>' +
      '<div class="dash-admin-form-group"><label>Role</label><input type="text" class="dash-aff-role" data-idx="' + i + '" value="' + esc(a.role) + '" placeholder="e.g. Member, Director"></div>' +
      '</div>' +
      (affiliations.length > 1 ? '<button type="button" class="dash-btn dash-btn--red dash-btn--sm remove-affiliation" data-idx="' + i + '" style="margin-top:8px">' + icon('trash', 12) + ' Remove</button>' : '') +
      '</div>';
  }).join('');

  affList.querySelectorAll('.dash-aff-name').forEach(function(el) {
    el.addEventListener('change', function() { affiliations[parseInt(this.dataset.idx)].name = this.value; });
  });
  affList.querySelectorAll('.dash-aff-acronym').forEach(function(el) {
    el.addEventListener('change', function() { affiliations[parseInt(this.dataset.idx)].acronym = this.value; });
  });
  affList.querySelectorAll('.dash-aff-role').forEach(function(el) {
    el.addEventListener('change', function() { affiliations[parseInt(this.dataset.idx)].role = this.value; });
  });
  affList.querySelectorAll('.remove-affiliation').forEach(function(btn) {
    btn.addEventListener('click', function() {
      affiliations.splice(parseInt(this.dataset.idx), 1);
      renderAffiliations();
    });
  });
}
renderAffiliations();

document.getElementById('add-affiliation-btn').addEventListener('click', function() {
  affiliations.push({name:'',acronym:'',role:''});
  renderAffiliations();
});
```

**C. Connections section** — Add after affiliations:

```javascript
html += '<div class="dash-section">';
html += '<div class="dash-section-title">' + icon('link', 18) + ' Connections</div>';
html += '<div id="dash-connections-list" class="dash-sub-grid"></div>';
html += '<button type="button" class="dash-btn dash-btn--outline dash-btn--sm" id="add-connection-btn" style="margin-top:12px">' + icon('plus', 14) + ' Add Connection</button>';
html += '</div>';
```

After form renders, add:

```javascript
// Init connections
var connList = document.getElementById('dash-connections-list');
var connections = u.connections || [];

function renderConnections() {
  if (!connections.length) {
    connections = [{url:'',type:'social'}];
  }
  connList.innerHTML = connections.map(function(c, i) {
    return '<div class="dash-sub-card" style="padding:16px">' +
      '<div class="dash-admin-form-grid">' +
      '<div class="dash-admin-form-group"><label>URL / Handle</label><input type="text" class="dash-conn-url" data-idx="' + i + '" value="' + esc(c.url) + '" placeholder="e.g. linkedin.com/in/username"></div>' +
      '<div class="dash-admin-form-group"><label>Type</label><select class="dash-conn-type" data-idx="' + i + '">' +
      '<option value="social"' + (c.type === 'social' ? ' selected' : '') + '>Social</option>' +
      '<option value="website"' + (c.type === 'website' ? ' selected' : '') + '>Website</option>' +
      '<option value="email"' + (c.type === 'email' ? ' selected' : '') + '>Email</option>' +
      '<option value="other"' + (c.type === 'other' ? ' selected' : '') + '>Other</option>' +
      '</select></div>' +
      '</div>' +
      (connections.length > 1 ? '<button type="button" class="dash-btn dash-btn--red dash-btn--sm remove-connection" data-idx="' + i + '" style="margin-top:8px">' + icon('trash', 12) + ' Remove</button>' : '') +
      '</div>';
  }).join('');

  connList.querySelectorAll('.dash-conn-url').forEach(function(el) {
    el.addEventListener('change', function() { connections[parseInt(this.dataset.idx)].url = this.value; });
  });
  connList.querySelectorAll('.dash-conn-type').forEach(function(el) {
    el.addEventListener('change', function() { connections[parseInt(this.dataset.idx)].type = this.value; });
  });
  connList.querySelectorAll('.remove-connection').forEach(function(btn) {
    btn.addEventListener('click', function() {
      connections.splice(parseInt(this.dataset.idx), 1);
      renderConnections();
    });
  });
}
renderConnections();

document.getElementById('add-connection-btn').addEventListener('click', function() {
  connections.push({url:'',type:'social'});
  renderConnections();
});
```

**D. Save affiliations and connections** — Find the profile form submit handler and add affiliations and connections to the payload:

```javascript
payload.affiliations = affiliations.filter(function(a) { return a.name.trim(); });
payload.connections = connections.filter(function(c) { return c.url.trim(); });
```

### 2. Update `css/dashboard.css` — Add tag input styles

Read `css/dashboard.css` and append at the end:

```css
/* ═══ Tags Input ═══ */
.dash-tags-input{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);min-height:42px;align-items:center;cursor:text}
.dash-tags-input:focus-within{border-color:var(--gold)}
.dash-tags-list{display:flex;flex-wrap:wrap;gap:6px}
.dash-tag{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:var(--gold-dim);color:var(--gold);border-radius:100px;font-size:0.75rem;font-weight:500}
.dash-tag-remove{background:none;border:none;color:var(--gold);cursor:pointer;padding:0;font-size:1rem;line-height:1;opacity:0.7}
.dash-tag-remove:hover{opacity:1}
```

### 3. Update `api/user.php` — Handle new profile fields

Read `api/user.php` and find where profile update happens (the `update-profile` action). Add handling for the new fields:

In the UPDATE query, add columns for `affiliations` and `connections` (JSON encode them):
```php
$affiliations = json_encode($_POST['affiliations'] ?? []);
$connections = json_encode($_POST['connections'] ?? []);
```

Wait — the API receives JSON body, not POST data. Look at how the existing fields are handled and add:
```php
$affiliations = json_encode($input['affiliations'] ?? []);
$connections = json_encode($input['connections'] ?? []);
```

Add these to the UPDATE SQL query. If the columns don't exist yet, you'll need to add them. Check the schema and add ALTER TABLE if needed.

### 4. Update `api/schema.sql` — Add new columns

Read `api/schema.sql` and add to the users table definition (or create an ALTER TABLE):
```sql
ALTER TABLE users ADD COLUMN affiliations JSON AFTER interests;
ALTER TABLE users ADD COLUMN connections JSON AFTER affiliations;
```

Run the ALTER TABLE commands against the database using:
```bash
& "M:\Dev\xampp\mysql\bin\mysql.exe" -u root usc_database -e "ALTER TABLE users ADD COLUMN affiliations JSON AFTER interests; ALTER TABLE users ADD COLUMN connections JSON AFTER affiliations;"
```

Make all edits using the Edit tool. Report all changes made.


###Instruction on pending
 splendid, some miner issues and refinements.
1. some images are referenced as image.png.jpg ->fails
2. there is no back button from dashboard to site,
3. should add affiliations for user profile ie.
interests -> autofill + new typed
affiliations, add + new
<organisation/group name, acronym, role> [if new, register to portal?]

on links;
connections, add new
<social/web url (eg. linkedin.com/in/my-username), type (social | website | email | other)>
other refinements:
submit and rate answers on FAQ
Perhaps could have FAQ, and other questions (submit your public questions)
make hero-3 default for any failed/absent image, and emblem as profile default




