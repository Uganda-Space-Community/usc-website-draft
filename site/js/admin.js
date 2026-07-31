/* ═══════════════════════════════════════════════════
   USC Admin Panel — js/admin.js
   Config-driven admin interface for the USC platform
   ═══════════════════════════════════════════════════ */

const USC_ADMIN = (function () {

  // ─────────────────────────────────────
  //  RESOURCE DEFINITIONS
  // ─────────────────────────────────────

  const RESOURCE_TYPES = {
    submissions:  { label: 'Submissions',  icon: 'inbox',     singular: 'Submission',  allowCreate: false },
    events:       { label: 'Events',       icon: 'calendar',  singular: 'Event',       type: 'event' },
    programs:     { label: 'Programs',     icon: 'rocket',    singular: 'Program',     type: 'program' },
    projects:     { label: 'Projects',     icon: 'folder',    singular: 'Project',     type: 'project' },
    organizations:{ label: 'Organizations',icon: 'building',  singular: 'Organization',type: 'organization' },
    news:         { label: 'News',         icon: 'newspaper', singular: 'News',        type: 'news' },
    articles:     { label: 'Articles',     icon: 'file-text', singular: 'Article',     type: 'article' },
    opportunities:{ label: 'Opportunities',icon: 'gift',      singular: 'Opportunity', type: 'opportunity' },
    users:        { label: 'Users',        icon: 'users',     singular: 'User',        noType: true },
    settings:     { label: 'Settings',     icon: 'settings',  singular: 'Setting',     noType: true }
  };

  const FIELDS = {
    event: [
      { name: 'title',       label: 'Title',       type: 'text',     required: true },
      { name: 'date',        label: 'Date',        type: 'date',     required: true },
      { name: 'location',    label: 'Location',    type: 'text' },
      { name: 'category',    label: 'Category',    type: 'select',   options: [
        { label: 'Physical', value: 'Physical' }, { label: 'Virtual', value: 'Virtual' },
        { label: 'Workshop', value: 'Workshop' }, { label: 'Competition', value: 'Competition' }
      ]},
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image',       label: 'Image URL',   type: 'url' }
    ],
    program: [
      { name: 'title',       label: 'Title',       type: 'text',     required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'start',       label: 'Start Date',  type: 'date' },
      { name: 'end',         label: 'End Date',    type: 'date' },
      { name: 'tags',        label: 'Tags',        type: 'text',     helpText: 'Comma-separated' },
      { name: 'image',       label: 'Image URL',   type: 'url' },
      { name: 'status',      label: 'Status',      type: 'select',   options: [
        { label: 'Active', value: 'active' }, { label: 'Completed', value: 'completed' },
        { label: 'Planned', value: 'planned' }, { label: 'Proposed', value: 'proposed' }
      ]}
    ],
    project: [
      { name: 'title',       label: 'Title',       type: 'text',     required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'status',      label: 'Status',      type: 'select',   options: [
        { label: 'Active', value: 'Active' }, { label: 'Completed', value: 'Completed' }
      ]},
      { name: 'tags',        label: 'Tags',        type: 'text',     helpText: 'Comma-separated' },
      { name: 'image',       label: 'Image URL',   type: 'url' }
    ],
    organization: [
      { name: 'name',         label: 'Name',         type: 'text',     required: true },
      { name: 'type',         label: 'Type',         type: 'select',   options: [
        { label: 'University', value: 'University' }, { label: 'Agency', value: 'Agency' },
        { label: 'NGO', value: 'NGO' }, { label: 'Innovation Hub', value: 'Innovation Hub' },
        { label: 'Government', value: 'Government' }, { label: 'Other', value: 'Other' }
      ]},
      { name: 'description',  label: 'Description',  type: 'textarea' },
      { name: 'website',      label: 'Website',      type: 'url' },
      { name: 'location',     label: 'Location',     type: 'text' },
      { name: 'contactEmail', label: 'Contact Email', type: 'email' }
    ],
    news: [
      { name: 'title',    label: 'Title',    type: 'text',     required: true },
      { name: 'author',   label: 'Author',   type: 'text' },
      { name: 'category', label: 'Category', type: 'select',   options: [
        { label: 'Policy', value: 'Policy' }, { label: 'University', value: 'University' },
        { label: 'Infrastructure', value: 'Infrastructure' }, { label: 'General', value: 'General' }
      ]},
      { name: 'summary',  label: 'Summary',  type: 'textarea' },
      { name: 'image',    label: 'Image URL', type: 'url' }
    ],
    article: [
      { name: 'title',    label: 'Title',    type: 'text',     required: true },
      { name: 'author',   label: 'Author',   type: 'text' },
      { name: 'category', label: 'Category', type: 'select',   options: [
        { label: 'Analysis', value: 'Analysis' }, { label: 'Tutorial', value: 'Tutorial' },
        { label: 'Opinion', value: 'Opinion' }, { label: 'Research', value: 'Research' }
      ]},
      { name: 'summary',  label: 'Summary',  type: 'textarea' },
      { name: 'content',  label: 'Content',  type: 'textarea',  tall: true },
      { name: 'image',    label: 'Image URL', type: 'url' }
    ],
    opportunity: [
      { name: 'title',       label: 'Title',       type: 'text',     required: true },
      { name: 'type',        label: 'Type',        type: 'select',   options: [
        { label: 'Scholarship', value: 'Scholarship' }, { label: 'Internship', value: 'Internship' },
        { label: 'Grant', value: 'Grant' }, { label: 'Fellowship', value: 'Fellowship' }
      ]},
      { name: 'deadline',    label: 'Deadline',    type: 'date' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'link',        label: 'Link URL',    type: 'url' },
      { name: 'image',       label: 'Image URL',   type: 'url' }
    ]
  };

  const LIST_COLUMNS = {
    submissions: ['id', 'type', 'title', 'status', 'author_name', 'created_at'],
    events:      ['id', 'title', 'date', 'location', 'category', 'status'],
    programs:    ['id', 'title', 'start', 'end', 'status'],
    projects:    ['id', 'title', 'status'],
    organizations:['id', 'name', 'type', 'location'],
    news:        ['id', 'title', 'author', 'category', 'status'],
    articles:    ['id', 'title', 'author', 'category', 'status'],
    opportunities:['id', 'title', 'type', 'deadline', 'status'],
    users:       ['id', 'name', 'email', 'role', 'status', 'created_at'],
    settings:    ['key', 'value']
  };

  // ─────────────────────────────────────
  //  STATE
  // ─────────────────────────────────────

  let _user = null;
  let _currentRoute = '';
  let _stats = null;

  // ─────────────────────────────────────
  //  API HELPERS
  // ─────────────────────────────────────

  async function api(endpoint, options = {}) {
    const url = 'api/' + endpoint;
    const config = { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...options };
    if (config.body && typeof config.body === 'object') config.body = JSON.stringify(config.body);
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  }

  async function loadStats() {
    try { _stats = await api('admin.php?action=stats'); } catch (e) { _stats = {}; }
  }

  // ─────────────────────────────────────
  //  ICONS (inline SVG)
  // ─────────────────────────────────────

  const ICONS = {
    inbox:     '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>',
    calendar:  '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    rocket:    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    folder:    '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',
    building:  '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22V12h6v10"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/>',
    newspaper: '<path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/>',
    'file-text':'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    gift:      '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>',
    users:     '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
    plus:      '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    search:    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    edit:      '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    trash:     '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
    check:     '<polyline points="20 6 9 17 4 12"/>',
    x:         '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chevronLeft:'<polyline points="15 18 9 12 15 6"/>',
    chevronRight:'<polyline points="9 18 15 12 9 6"/>',
    logOut:    '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    database:  '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    eye:       '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
  };

  function icon(name, size) {
    size = size || 16;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  // ─────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────

  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function statusBadge(status) {
    const colors = { pending: 'gold', approved: 'emerald', rejected: 'red', active: 'emerald', suspended: 'red' };
    const c = colors[status] || 'gold';
    return '<span class="admin-badge admin-badge--' + c + '">' + esc(status) + '</span>';
  }

  function typeBadge(type) {
    return '<span class="admin-badge admin-badge--blue">' + esc(type) + '</span>';
  }

  // ─────────────────────────────────────
  //  ROUTER
  // ─────────────────────────────────────

  function navigate(hash) {
    window.location.hash = hash;
  }

  function parseRoute() {
    const hash = window.location.hash.slice(1) || '';
    const parts = hash.split('/').filter(Boolean);
    return { resource: parts[0] || '', action: parts[1] || '', id: parts[2] || '' };
  }

  async function handleRoute() {
    const route = parseRoute();
    _currentRoute = route.resource;
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = '<div class="admin-loading">Loading...</div>';

    try {
      if (!route.resource) {
        await renderDashboard(content);
      } else if (route.resource === 'users' && route.action === 'profile' && route.id) {
        await renderUserProfile(content, route.id);
      } else if (route.resource === 'users') {
        await renderUsers(content);
      } else if (route.resource === 'settings') {
        await renderSettings(content);
      } else if (route.resource === 'submissions' && route.action === 'review') {
        await renderReviewQueue(content);
      } else if (route.action === 'new') {
        await renderCreateForm(content, route.resource);
      } else if (route.action === 'edit' && route.id) {
        await renderEditForm(content, route.resource, route.id);
      } else {
        await renderResourceList(content, route.resource);
      }
    } catch (e) {
      content.innerHTML = '<div class="admin-error"><p>Error loading content</p><pre>' + esc(e.error || e.message || 'Unknown error') + '</pre></div>';
    }

    updateSidebar();
  }

  // ─────────────────────────────────────
  //  SIDEBAR
  // ─────────────────────────────────────

  function updateSidebar() {
    document.querySelectorAll('.admin-nav-link').forEach(function (link) {
      const href = link.getAttribute('href');
      const hash = href ? href.replace('#', '') : '';
      const active = hash === _currentRoute || (_currentRoute === '' && hash === '');
      link.classList.toggle('active', active);
    });
  }

  function renderSidebar() {
    var html = '<div class="admin-sidebar-inner">';
    // Logo
    html += '<a href="#admin-content" class="admin-logo">';
    html += '<span class="admin-logo-icon">' + icon('database', 20) + '</span>';
    html += '<span class="admin-logo-text"><strong>USC</strong><small>Admin</small></span>';
    html += '</a>';
    // Nav
    html += '<nav class="admin-nav">';
    html += '<a href="#" class="admin-nav-link' + (_currentRoute === '' ? ' active' : '') + '">' + icon('database', 16) + ' Dashboard</a>';
    for (var slug in RESOURCE_TYPES) {
      var r = RESOURCE_TYPES[slug];
      html += '<a href="#' + slug + '" class="admin-nav-link' + (_currentRoute === slug ? ' active' : '') + '">' + icon(r.icon, 16) + ' ' + r.label + '</a>';
    }
    // Review queue shortcut
    html += '<a href="#submissions/review" class="admin-nav-link">' + icon('eye', 16) + ' Review Queue</a>';
    html += '</nav>';
    // Sign out
    html += '<div class="admin-sidebar-footer">';
    html += '<button onclick="USC_ADMIN.signOut()" class="admin-btn admin-btn--outline admin-btn--full">' + icon('logOut', 16) + ' Sign Out</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ─────────────────────────────────────
  //  DASHBOARD
  // ─────────────────────────────────────

  async function renderDashboard(el) {
    await loadStats();
    var s = _stats || {};
    var html = '<div class="admin-grid">';
    // Pending review
    html += '<a href="#submissions/review" class="admin-card admin-card--gold">';
    html += '<div class="admin-card-icon">' + icon('inbox', 24) + '</div>';
    html += '<div class="admin-card-body">';
    html += '<div class="admin-card-count">' + (s.submissions_pending || 0) + '</div>';
    html += '<div class="admin-card-label">Pending Review</div>';
    html += '</div></a>';
    // Content cards
    var contentResources = ['events','programs','projects','organizations','news','articles','opportunities'];
    contentResources.forEach(function (slug) {
      var r = RESOURCE_TYPES[slug];
      var count = s[slug] || 0;
      html += '<a href="#' + slug + '" class="admin-card">';
      html += '<div class="admin-card-icon">' + icon(r.icon, 24) + '</div>';
      html += '<div class="admin-card-body">';
      html += '<div class="admin-card-count">' + count + '</div>';
      html += '<div class="admin-card-label">' + r.label + '</div>';
      html += '</div></a>';
    });
    // Users
    html += '<a href="#users" class="admin-card">';
    html += '<div class="admin-card-icon">' + icon('users', 24) + '</div>';
    html += '<div class="admin-card-body">';
    html += '<div class="admin-card-count">' + (s.users_total || 0) + '</div>';
    html += '<div class="admin-card-label">Users</div>';
    html += '</div></a>';
    html += '</div>';

    // Recent Activity
    var recentReviews = s.recent_reviews || [];
    var recentSubmissions = s.recent_submissions || [];
    if (recentReviews.length > 0 || recentSubmissions.length > 0) {
      html += '<div style="margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:24px">';

      // Recent Reviews
      html += '<div class="admin-card" style="flex-direction:column;align-items:stretch;text-align:left;padding:20px">';
      html += '<h3 style="font-size:0.92rem;font-weight:600;margin-bottom:16px">' + icon('eye', 16) + ' Recent Reviews</h3>';
      recentReviews.forEach(function (r) {
        html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.78rem">';
        html += statusBadge(r.status);
        html += '<a href="#submissions/edit/' + r.id + '" class="admin-link">' + esc(r.type) + ' #' + r.id + '</a>';
        html += '<span style="color:var(--text-3);margin-left:auto">' + esc(r.reviewer_name || '') + '</span>';
        html += '</div>';
      });
      html += '</div>';

      // Recent Submissions
      html += '<div class="admin-card" style="flex-direction:column;align-items:stretch;text-align:left;padding:20px">';
      html += '<h3 style="font-size:0.92rem;font-weight:600;margin-bottom:16px">' + icon('inbox', 16) + ' Recent Submissions</h3>';
      recentSubmissions.forEach(function (s) {
        html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.78rem">';
        html += typeBadge(s.type);
        html += statusBadge(s.status);
        html += '<a href="#submissions/edit/' + s.id + '" class="admin-link">#' + s.id + '</a>';
        html += '<span style="color:var(--text-3);margin-left:auto">' + esc(s.author_name || 'Anonymous') + '</span>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    }

    el.innerHTML = html;
  }

  // ─────────────────────────────────────
  //  RESOURCE LIST
  // ─────────────────────────────────────

  async function renderResourceList(el, slug) {
    var res = RESOURCE_TYPES[slug];
    if (!res) { el.innerHTML = '<p>Unknown resource</p>'; return; }

    var params = new URLSearchParams();
    params.set('action', 'list');
    if (res.type) params.set('type', res.type);
    params.set('limit', '50');

    var data = await api('admin.php?' + params.toString());
    var records = data.records || [];
    var cols = LIST_COLUMNS[slug] || ['id', 'title', 'status'];

    var html = '<div class="admin-header-row">';
    html += '<h2>' + esc(res.label) + ' <span class="admin-count">' + data.total + '</span></h2>';
    html += '<div class="admin-header-actions">';
    // Search
    html += '<div class="admin-search">' + icon('search', 16) + '<input type="text" placeholder="Search..." id="admin-search" onkeyup="USC_ADMIN.searchResource(\'' + slug + '\')"></div>';
    if (!res.allowCreate === false) {
      html += '<a href="#' + slug + '/new" class="admin-btn admin-btn--gold">' + icon('plus', 16) + ' New ' + res.singular + '</a>';
    }
    html += '</div></div>';

    // Table
    html += '<div class="admin-table-wrap"><table class="admin-table">';
    html += '<thead><tr>';
    cols.forEach(function (col) {
      html += '<th>' + esc(col.charAt(0).toUpperCase() + col.slice(1)) + '</th>';
    });
    html += '<th>Actions</th>';
    html += '</tr></thead><tbody>';

    if (records.length === 0) {
      html += '<tr><td colspan="' + (cols.length + 1) + '" class="admin-empty">No records found.</td></tr>';
    }

    records.forEach(function (rec) {
      html += '<tr>';
      cols.forEach(function (col) {
        var val = rec[col] !== undefined ? rec[col] : (rec.payload ? rec.payload[col] : '');
        if (col === 'status') val = statusBadge(val);
        else if (col === 'type') val = typeBadge(val);
        else if (col === 'created_at' || col === 'date' || col === 'deadline' || col === 'start' || col === 'end') val = formatDate(val);
        else val = esc(String(val || '—').substring(0, 80));
        html += '<td>' + val + '</td>';
      });
      html += '<td class="admin-actions">';
      if (slug === 'users') {
        html += '<span class="admin-table-info" title="Role: ' + esc(rec.role) + '">' + icon('eye', 14) + '</span>';
      } else {
        html += '<a href="#' + slug + '/edit/' + rec.id + '" class="admin-action-btn" title="Edit">' + icon('edit', 14) + '</a>';
        html += '<button class="admin-action-btn admin-action-btn--red" onclick="USC_ADMIN.deleteRecord(' + rec.id + ',\'' + slug + '\')" title="Delete">' + icon('trash', 14) + '</button>';
      }
      html += '</td></tr>';
    });

    html += '</tbody></table></div>';
    // Pagination
    if (data.pages > 1) {
      html += '<div class="admin-pagination">';
      html += '<span>Page ' + data.page + ' of ' + data.pages + '</span>';
      if (data.page > 1) html += '<button onclick="USC_ADMIN.goPage(\'' + slug + '\',' + (data.page - 1) + ')" class="admin-btn admin-btn--sm">' + icon('chevronLeft', 14) + ' Prev</button>';
      if (data.page < data.pages) html += '<button onclick="USC_ADMIN.goPage(\'' + slug + '\',' + (data.page + 1) + ')" class="admin-btn admin-btn--sm">Next ' + icon('chevronRight', 14) + '</button>';
      html += '</div>';
    }
    el.innerHTML = html;
  }

  // ─────────────────────────────────────
  //  CREATE / EDIT FORM
  // ─────────────────────────────────────

  function renderForm(slug, record) {
    var res = RESOURCE_TYPES[slug];
    var fields = FIELDS[slug === 'submissions' ? (record ? record.type : 'event') : (res.type || slug)];
    if (!fields) return '<p>No form configuration for this resource.</p>';

    var isEdit = !!record;
    var payload = record ? record.payload : {};

    var html = '<form id="admin-form" class="admin-form" onsubmit="return false">';
    html += '<div class="admin-form-grid">';
    fields.forEach(function (f) {
      var val = payload[f.name] !== undefined ? payload[f.name] : '';
      var span = (f.type === 'textarea' || f.tall) ? ' admin-form-full' : '';
      html += '<div class="admin-form-group' + span + '">';
      html += '<label for="field-' + f.name + '">' + esc(f.label) + (f.required ? ' <span class="required">*</span>' : '') + '</label>';
      if (f.type === 'textarea') {
        html += '<textarea id="field-' + f.name + '" name="' + f.name + '" rows="' + (f.tall ? 8 : 4) + '"' + (f.required ? ' required' : '') + '>' + esc(val) + '</textarea>';
      } else if (f.type === 'select') {
        html += '<select id="field-' + f.name + '" name="' + f.name + '"' + (f.required ? ' required' : '') + '>';
        html += '<option value="">Select...</option>';
        (f.options || []).forEach(function (opt) {
          html += '<option value="' + esc(opt.value) + '"' + (val === opt.value ? ' selected' : '') + '>' + esc(opt.label) + '</option>';
        });
        html += '</select>';
      } else if (f.type === 'checkbox') {
        html += '<label class="admin-checkbox"><input type="checkbox" id="field-' + f.name + '" name="' + f.name + '"' + (val ? ' checked' : '') + '> ' + esc(f.label) + '</label>';
      } else {
        html += '<input type="' + f.type + '" id="field-' + f.name + '" name="' + f.name + '" value="' + esc(val) + '"' + (f.required ? ' required' : '') + '>';
      }
      if (f.helpText) html += '<small>' + esc(f.helpText) + '</small>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="admin-form-actions">';
    html += '<button type="submit" class="admin-btn admin-btn--gold" onclick="USC_ADMIN.saveRecord(\'' + slug + '\',' + (isEdit ? record.id : 'null') + ')">' + icon('check', 16) + ' ' + (isEdit ? 'Save Changes' : 'Create') + '</button>';
    html += '<a href="#' + slug + '" class="admin-btn admin-btn--outline">Cancel</a>';
    if (isEdit) {
      html += '<button type="button" class="admin-btn admin-btn--red" onclick="USC_ADMIN.deleteRecord(' + record.id + ',\'' + slug + '\')">' + icon('trash', 16) + ' Delete</button>';
    }
    html += '</div>';
    html += '</form>';
    return html;
  }

  async function renderCreateForm(el, slug) {
    var res = RESOURCE_TYPES[slug];
    el.innerHTML = '<div class="admin-header-row"><h2>New ' + esc(res.singular) + '</h2></div>' + renderForm(slug, null);
  }

  async function renderEditForm(el, slug, id) {
    el.innerHTML = '<div class="admin-loading">Loading record...</div>';
    var rec = await api('admin.php?action=get&id=' + id);
    var res = RESOURCE_TYPES[slug];
    el.innerHTML = '<div class="admin-header-row"><h2>Edit ' + esc(res.singular) + ' #' + id + '</h2></div>' + renderForm(slug, rec);
  }

  // ─────────────────────────────────────
  //  SAVE / DELETE
  // ─────────────────────────────────────

  async function saveRecord(slug, id) {
    var form = document.getElementById('admin-form');
    if (!form) return;
    var res = RESOURCE_TYPES[slug];
    var fields = FIELDS[slug === 'submissions' ? 'event' : (res.type || slug)];
    var payload = {};
    var valid = true;

    (fields || []).forEach(function (f) {
      var el = document.getElementById('field-' + f.name);
      if (!el) return;
      if (f.type === 'checkbox') {
        payload[f.name] = el.checked;
      } else {
        var val = el.value.trim();
        if (f.required && !val) { valid = false; el.focus(); }
        payload[f.name] = val;
      }
    });

    if (!valid) { alert('Please fill in all required fields.'); return; }

    var btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      if (id) {
        await api('admin.php', { method: 'POST', body: { action: 'update', id: id, payload: payload } });
      } else {
        var type = res.type || slug;
        await api('admin.php', { method: 'POST', body: { action: 'create', type: type, payload: payload } });
      }
      navigate('#' + slug);
    } catch (e) {
      alert(e.error || 'Save failed');
      btn.disabled = false;
      btn.textContent = id ? 'Save Changes' : 'Create';
    }
  }

  async function deleteRecord(id, slug) {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    try {
      await api('admin.php', { method: 'POST', body: { action: 'delete', id: id } });
      navigate('#' + slug);
    } catch (e) {
      alert(e.error || 'Delete failed');
    }
  }

  // ─────────────────────────────────────
  //  REVIEW QUEUE
  // ─────────────────────────────────────

  async function renderReviewQueue(el) {
    var params = new URLSearchParams({ action: 'list', status: 'pending', limit: '50' });
    var data = await api('admin.php?' + params.toString());
    var records = data.records || [];

    var html = '<div class="admin-header-row">';
    html += '<h2>Review Queue <span class="admin-count">' + data.total + ' pending</span></h2>';
    html += '<div class="admin-header-actions">';
    html += '<select id="review-type-filter" onchange="USC_ADMIN.filterReview()" class="admin-select">';
    html += '<option value="">All Types</option>';
    ['event','program','project','organization','news','article','opportunity'].forEach(function (t) {
      html += '<option value="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + 's</option>';
    });
    html += '</select>';
    html += '<button onclick="USC_ADMIN.bulkReview(\'approved\')" class="admin-btn admin-btn--green">Approve Selected</button>';
    html += '<button onclick="USC_ADMIN.bulkReview(\'rejected\')" class="admin-btn admin-btn--red">Reject Selected</button>';
    html += '</div></div>';

    if (records.length === 0) {
      html += '<div class="admin-empty-state"><p>No pending submissions. All clear!</p></div>';
      el.innerHTML = html;
      return;
    }

    records.forEach(function (rec) {
      var p = rec.payload || {};
      var title = p.title || p.name || p.question || '(untitled)';
      html += '<div class="admin-review-card" data-id="' + rec.id + '">';
      html += '<div class="admin-review-header">';
      html += '<label class="admin-checkbox"><input type="checkbox" class="review-select" value="' + rec.id + '"></label>';
      html += typeBadge(rec.type);
      html += '<strong>' + esc(title) + '</strong>';
      html += '<span class="admin-review-meta">by ' + esc(rec.author_name || 'Anonymous') + ' · ' + formatDate(rec.created_at) + '</span>';
      html += '</div>';
      // Payload preview
      html += '<div class="admin-review-payload">';
      for (var k in p) {
        if (k === 'title' || k === 'name') continue;
        var v = p[k];
        if (v && String(v).length > 200) v = String(v).substring(0, 200) + '...';
        html += '<div class="admin-review-field"><span class="admin-review-key">' + esc(k) + ':</span> ' + esc(v || '—') + '</div>';
      }
      html += '</div>';
      // Actions
      html += '<div class="admin-review-actions">';
      html += '<input type="text" class="admin-input admin-review-note" placeholder="Review note (optional)">';
      html += '<button onclick="USC_ADMIN.reviewOne(' + rec.id + ',\'approved\')" class="admin-btn admin-btn--green btn-sm">' + icon('check', 14) + ' Approve</button>';
      html += '<button onclick="USC_ADMIN.reviewOne(' + rec.id + ',\'rejected\')" class="admin-btn admin-btn--red btn-sm">' + icon('x', 14) + ' Reject</button>';
      html += '</div>';
      html += '</div>';
    });

    el.innerHTML = html;
  }

  async function reviewOne(id, status) {
    var card = document.querySelector('.admin-review-card[data-id="' + id + '"]');
    var note = card ? card.querySelector('.admin-review-note').value : '';
    try {
      await api('admin.php', { method: 'POST', body: { action: 'review', id: id, status: status, note: note } });
      card.remove();
      // Update count
      var countEl = document.querySelector('.admin-count');
      if (countEl) {
        var n = parseInt(countEl.textContent) - 1;
        countEl.textContent = Math.max(0, n) + ' pending';
      }
    } catch (e) {
      alert(e.error || 'Review failed');
    }
  }

  async function bulkReview(status) {
    var checks = document.querySelectorAll('.review-select:checked');
    var ids = Array.from(checks).map(function (c) { return parseInt(c.value); });
    if (ids.length === 0) { alert('Select submissions first.'); return; }
    if (!confirm(status === 'approved' ? 'Approve ' + ids.length + ' submissions?' : 'Reject ' + ids.length + ' submissions?')) return;
    try {
      await api('admin.php', { method: 'POST', body: { action: 'bulk-review', ids: ids, status: status } });
      ids.forEach(function (id) {
        var card = document.querySelector('.admin-review-card[data-id="' + id + '"]');
        if (card) card.remove();
      });
    } catch (e) {
      alert(e.error || 'Bulk review failed');
    }
  }

  function filterReview() {
    handleRoute(); // re-render with current filters
  }

  // ─────────────────────────────────────
  //  USERS
  // ─────────────────────────────────────

  async function renderUsers(el) {
    var params = new URLSearchParams({ action: 'users', limit: '50' });
    var data = await api('admin.php?' + params.toString());
    var users = data.users || [];

    var html = '<div class="admin-header-row">';
    html += '<h2>Users <span class="admin-count">' + data.total + '</span></h2>';
    html += '<div class="admin-header-actions">';
    html += '<div class="admin-search">' + icon('search', 16) + '<input type="text" placeholder="Search users..." id="admin-user-search" onkeyup="USC_ADMIN.searchUsers()"></div>';
    html += '<select id="admin-role-filter" onchange="USC_ADMIN.filterUsers()" class="admin-select">';
    html += '<option value="">All Roles</option>';
    html += '<option value="member">Member</option>';
    html += '<option value="curator">Curator</option>';
    html += '<option value="admin">Admin</option>';
    html += '</select>';
    html += '</div></div>';

    html += '<div class="admin-table-wrap"><table class="admin-table">';
    html += '<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>';

    users.forEach(function (u) {
      html += '<tr>';
      html += '<td class="admin-mono">' + u.id + '</td>';
      html += '<td><a href="#users/profile/' + u.id + '" class="admin-link">' + esc(u.name) + '</a></td>';
      html += '<td>' + esc(u.email) + '</td>';
      html += '<td><select class="admin-select admin-select-sm" onchange="USC_ADMIN.changeRole(' + u.id + ',this.value)">';
      ['member','curator','admin'].forEach(function (r) {
        html += '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r + '</option>';
      });
      html += '</select></td>';
      html += '<td>' + statusBadge(u.status) + '</td>';
      html += '<td>' + formatDate(u.created_at) + '</td>';
      html += '<td class="admin-actions">';
      html += '<a href="#users/profile/' + u.id + '" class="admin-action-btn" title="View Profile">' + icon('eye', 14) + '</a>';
      html += '<button class="admin-action-btn" onclick="USC_ADMIN.toggleStatus(' + u.id + ')" title="' + (u.status === 'active' ? 'Suspend' : 'Unsuspend') + '">' + icon(u.status === 'active' ? 'x' : 'check', 14) + '</button>';
      html += '</td></tr>';
    });

    html += '</tbody></table></div>';
    el.innerHTML = html;
  }

  async function changeRole(userId, role) {
    try {
      await api('admin.php', { method: 'POST', body: { action: 'update-role', user_id: userId, role: role } });
    } catch (e) {
      alert(e.error || 'Failed to change role');
      handleRoute();
    }
  }

  async function toggleStatus(userId) {
    try {
      await api('admin.php', { method: 'POST', body: { action: 'toggle-status', user_id: userId } });
      handleRoute();
    } catch (e) {
      alert(e.error || 'Failed');
    }
  }

  // ── User Profile View ──
  async function renderUserProfile(el, userId) {
    el.innerHTML = '<div class="admin-loading">Loading profile...</div>';
    try {
      var data = await api('admin.php?action=users&limit=50');
      var user = (data.users || []).find(function (u) { return u.id == userId; });
      if (!user) { el.innerHTML = '<p>User not found.</p>'; return; }

      // Get user's submissions
      var subs = await api('admin.php?action=list&limit=50');
      var userSubs = (subs.records || []).filter(function (s) { return s.author_email === user.email; });

      var html = '<div class="admin-header-row">';
      html += '<h2>' + esc(user.name) + '</h2>';
      html += '<a href="#users" class="admin-btn admin-btn--outline">' + icon('chevronLeft', 14) + ' Back to Users</a>';
      html += '</div>';

      html += '<div class="admin-profile-grid">';

      // Profile card
      html += '<div class="admin-profile-card">';
      html += '<div class="admin-profile-avatar">' + icon('users', 32) + '</div>';
      html += '<h3>' + esc(user.name) + '</h3>';
      html += '<p>' + esc(user.email) + '</p>';
      html += '<div style="margin-top:16px">' + statusBadge(user.status) + ' ' + typeBadge(user.role) + '</div>';
      html += '<div class="admin-profile-meta">';
      html += '<div><strong>Location:</strong> ' + esc(user.location || '—') + '</div>';
      html += '<div><strong>Joined:</strong> ' + formatDate(user.created_at) + '</div>';
      html += '<div><strong>Last Login:</strong> ' + (user.last_login ? formatDate(user.last_login) : 'Never') + '</div>';
      html += '</div>';
      html += '<div class="admin-profile-actions">';
      html += '<button class="admin-btn admin-btn--outline" onclick="USC_ADMIN.toggleStatus(' + user.id + ')">' + icon(user.status === 'active' ? 'x' : 'check', 14) + ' ' + (user.status === 'active' ? 'Suspend' : 'Unsuspend') + '</button>';
      html += '</div>';
      html += '</div>';

      // Submissions
      html += '<div class="admin-profile-subs">';
      html += '<h4>Submissions (' + userSubs.length + ')</h4>';
      if (userSubs.length === 0) {
        html += '<p class="admin-empty">No submissions yet.</p>';
      } else {
        html += '<div class="admin-table-wrap"><table class="admin-table">';
        html += '<thead><tr><th>Type</th><th>Title</th><th>Status</th><th>Date</th></tr></thead><tbody>';
        userSubs.forEach(function (s) {
          html += '<tr>';
          html += '<td>' + typeBadge(s.type) + '</td>';
          html += '<td><a href="#submissions/edit/' + s.id + '" class="admin-link">' + esc(s.title) + '</a></td>';
          html += '<td>' + statusBadge(s.status) + '</td>';
          html += '<td>' + formatDate(s.created_at) + '</td>';
          html += '</tr>';
        });
        html += '</tbody></table></div>';
      }
      html += '</div>';
      html += '</div>';

      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = '<div class="admin-error"><p>Failed to load profile.</p></div>';
    }
  }

  // ─────────────────────────────────────
  //  SETTINGS
  // ─────────────────────────────────────

  async function renderSettings(el) {
    var data = await api('admin.php?action=settings');
    var settings = data.settings || {};

    var html = '<div class="admin-header-row"><h2>Site Settings</h2></div>';
    html += '<form id="admin-settings-form" class="admin-form" onsubmit="return false">';
    html += '<div class="admin-form-grid">';

    var keys = [
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
      { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'textarea' },
      { key: 'twitter', label: 'Twitter URL', type: 'url' },
      { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
      { key: 'github', label: 'GitHub URL', type: 'url' },
      { key: 'facebook', label: 'Facebook URL', type: 'url' }
    ];

    keys.forEach(function (k) {
      var val = settings[k.key] || '';
      html += '<div class="admin-form-group' + (k.type === 'textarea' ? ' admin-form-full' : '') + '">';
      html += '<label>' + esc(k.label) + '</label>';
      if (k.type === 'textarea') {
        html += '<textarea id="setting-' + k.key + '" rows="3">' + esc(val) + '</textarea>';
      } else {
        html += '<input type="' + k.type + '" id="setting-' + k.key + '" value="' + esc(val) + '">';
      }
      html += '</div>';
    });

    html += '</div>';
    html += '<div class="admin-form-actions">';
    html += '<button type="submit" class="admin-btn admin-btn--gold" onclick="USC_ADMIN.saveSettings()">' + icon('check', 16) + ' Save Settings</button>';
    html += '</div></form>';
    el.innerHTML = html;
  }

  async function saveSettings() {
    var form = document.getElementById('admin-settings-form');
    var keys = ['tagline','contact_email','contact_phone','address','twitter','linkedin','github','facebook'];
    var data = {};
    keys.forEach(function (k) {
      var el = document.getElementById('setting-' + k);
      if (el) data[k] = el.value.trim();
    });
    var btn = form.querySelector('[type=submit]');
    btn.disabled = true; btn.textContent = 'Saving...';
    try {
      await api('admin.php', { method: 'POST', body: { action: 'settings', ...data } });
      btn.textContent = 'Saved!';
      setTimeout(function () { btn.textContent = 'Save Settings'; btn.disabled = false; }, 1500);
    } catch (e) {
      alert(e.error || 'Save failed');
      btn.disabled = false; btn.textContent = 'Save Settings';
    }
  }

  // ─────────────────────────────────────
  //  SEARCH / FILTER
  // ─────────────────────────────────────

  async function searchResource(slug) {
    var q = document.getElementById('admin-search').value;
    // Re-fetch with search param
    var res = RESOURCE_TYPES[slug];
    var params = new URLSearchParams({ action: 'list', limit: '50' });
    if (res.type) params.set('type', res.type);
    if (q) params.set('search', q);
    var data = await api('admin.php?' + params.toString());
    // Re-render just the table body
    // For simplicity, re-render the whole list
    handleRoute();
  }

  // ─────────────────────────────────────
  //  AUTH
  // ─────────────────────────────────────

  async function checkAuth() {
    try {
      var res = await api('auth.php?action=check');
      if (!res.user) { window.location.href = 'login.html'; return; }
      if (res.user.role !== 'admin' && res.user.role !== 'curator') {
        document.getElementById('admin-content').innerHTML = '<div class="admin-error"><h2>Access Denied</h2><p>You need admin or curator permissions to access this panel.</p><a href="index.html" class="admin-btn admin-btn--gold">Go Home</a></div>';
        return;
      }
      _user = res.user;
      document.getElementById('admin-user-name').textContent = _user.name;
      document.getElementById('admin-user-role').textContent = _user.role;
      renderSidebar();
      handleRoute();
    } catch (e) {
      window.location.href = 'login.html';
    }
  }

  async function signOut() {
    try { await api('auth.php?action=logout', { method: 'POST' }); } catch (e) {}
    window.location.href = 'login.html';
  }

  // ─────────────────────────────────────
  //  INIT
  // ─────────────────────────────────────

  function init() {
    checkAuth();
    window.addEventListener('hashchange', handleRoute);
  }

  return {
    init: init,
    signOut: signOut,
    deleteRecord: deleteRecord,
    saveRecord: saveRecord,
    reviewOne: reviewOne,
    bulkReview: bulkReview,
    filterReview: filterReview,
    changeRole: changeRole,
    toggleStatus: toggleStatus,
    saveSettings: saveSettings,
    searchResource: searchResource,
    goPage: function (slug, page) { navigate('#' + slug + '?page=' + page); }
  };
})();
