/* ═══════════════════════════════════════════════════
   USC Unified Dashboard — js/dashboard.js
   Hash-based routing, role-limited sidebar, section renderers
   ═══════════════════════════════════════════════════ */

const USC_DASH = (function () {

  // ─────────────────────────────────────
  //  NAV ITEMS (role-limited)
  // ─────────────────────────────────────

  const NAV_ITEMS = [
    { id: 'profile',    label: 'My Profile',      icon: 'user',          roles: ['member','curator','admin'] },
    { id: 'submissions',label: 'My Submissions',   icon: 'file-text',     roles: ['member','curator','admin'] },
    { id: 'submit',     label: 'Submit Content',   icon: 'plus-circle',   roles: ['member','curator','admin'] },
    { id: 'review',     label: 'Review Queue',     icon: 'check-circle',  roles: ['curator','admin'] },
    { id: 'content',    label: 'Content Manager',  icon: 'layers',        roles: ['curator','admin'] },
    { id: 'users',      label: 'Users',            icon: 'users',         roles: ['admin'] },
    { id: 'audit',      label: 'Audit Log',        icon: 'clock',         roles: ['curator','admin'] },
    { id: 'settings',   label: 'Settings',         icon: 'settings',      roles: ['admin'] },
  ];

  const CONTENT_TYPES = [
    { slug: 'events',       label: 'Events',       singular: 'Event',      type: 'event' },
    { slug: 'programs',     label: 'Programs',     singular: 'Program',    type: 'program' },
    { slug: 'projects',     label: 'Projects',     singular: 'Project',    type: 'project' },
    { slug: 'organizations',label: 'Organizations',singular: 'Organization',type: 'organization' },
    { slug: 'news',         label: 'News',         singular: 'News',       type: 'news' },
    { slug: 'articles',     label: 'Articles',     singular: 'Article',    type: 'article' },
    { slug: 'opportunities',label: 'Opportunities',singular: 'Opportunity',type: 'opportunity' },
  ];

  const SUBMISSION_TYPES = [
    { value: 'event',       label: 'Event' },
    { value: 'program',     label: 'Program' },
    { value: 'project',     label: 'Project' },
    { value: 'organization',label: 'Organization' },
    { value: 'news',        label: 'News' },
    { value: 'article',     label: 'Article' },
    { value: 'opportunity', label: 'Opportunity' },
  ];

  // ─────────────────────────────────────
  //  STATE
  // ─────────────────────────────────────

  let _user = null;
  let _currentSection = '';

  // ─────────────────────────────────────
  //  ICONS (Feather-style)
  // ─────────────────────────────────────

  const ICONS = {
    'user':         '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'file-text':    '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    'plus-circle':  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'layers':       '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    'users':        '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
    'clock':        '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'settings':     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
    'log-out':      '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    'search':       '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'check':        '<polyline points="20 6 9 17 4 12"/>',
    'x':            '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'trash':        '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
    'edit':         '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
    'chevron-right':'<polyline points="9 18 15 12 9 6"/>',
    'inbox':        '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>',
    'database':     '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    'eye':          '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    'calendar':     '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    'link':         '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>',
  };

  function icon(name, size) {
    size = size || 16;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function statusBadge(status) {
    var c = { pending:'gold', approved:'emerald', active:'emerald', rejected:'red', suspended:'red', completed:'blue' };
    return '<span class="dash-badge dash-badge--' + (c[status] || 'gold') + '">' + esc(status) + '</span>';
  }

  function typeBadge(type) {
    return '<span class="dash-badge dash-badge--blue">' + esc(type) + '</span>';
  }

  // ─────────────────────────────────────
  //  SIDEBAR
  // ─────────────────────────────────────

  function renderSidebar() {
    var html = '<div class="dash-sidebar-inner">';
    html += '<a href="index.html" class="dash-logo">';
    html += '<span class="dash-logo-icon">' + icon('database', 20) + '</span>';
    html += '<span class="dash-logo-text"><strong>USC</strong><small>Dashboard</small></span>';
    html += '</a>';

    html += '<a href="index.html" class="dash-nav-link" style="margin-bottom:8px;text-decoration:none">' + icon('chevron-left', 16) + ' Back to Site</a>';

    html += '<nav class="dash-nav">';
    NAV_ITEMS.forEach(function (item) {
      if (item.roles.indexOf(_user.role) === -1) return;
      var active = _currentSection === item.id ? ' active' : '';
      html += '<button class="dash-nav-link' + active + '" data-section="' + item.id + '">';
      html += icon(item.icon, 16) + ' ' + item.label;
      html += '</button>';
    });
    html += '</nav>';

    html += '<div class="dash-sidebar-footer">';
    html += '<div class="dash-user-info">';
    html += '<div class="dash-user-avatar">' + USC.getInitials(_user.name) + '</div>';
    html += '<div><div class="dash-user-name">' + esc(_user.name) + '</div>';
    html += '<div class="dash-user-role">' + esc(_user.role) + '</div></div>';
    html += '</div>';
    html += '<button class="dash-signout-btn" id="dash-signout">' + icon('log-out', 14) + ' Sign Out</button>';
    html += '</div>';
    html += '</div>';

    var sidebar = document.getElementById('dash-sidebar');
    sidebar.innerHTML = html;

    // Bind nav clicks
    sidebar.querySelectorAll('.dash-nav-link[data-section]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigateTo(btn.dataset.section);
        closeMobileSidebar();
      });
    });

    // Sign out
    var soBtn = document.getElementById('dash-signout');
    if (soBtn) soBtn.addEventListener('click', function () { USC.logout(); });
  }

  function updateSidebarActive() {
    document.querySelectorAll('.dash-nav-link[data-section]').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.section === _currentSection);
    });
  }

  // ─────────────────────────────────────
  //  MOBILE
  // ─────────────────────────────────────

  function openMobileSidebar() {
    document.getElementById('dash-sidebar').classList.add('open');
    document.getElementById('dash-backdrop').classList.add('open');
  }
  function closeMobileSidebar() {
    document.getElementById('dash-sidebar').classList.remove('open');
    document.getElementById('dash-backdrop').classList.remove('open');
  }

  // ─────────────────────────────────────
  //  ROUTING
  // ─────────────────────────────────────

  function navigateTo(section) {
    window.location.hash = '#' + section;
  }

  function parseRoute() {
    var hash = window.location.hash.slice(1) || 'profile';
    return hash.split('/')[0] || 'profile';
  }

  async function handleRoute() {
    var section = parseRoute();
    _currentSection = section;
    updateSidebarActive();
    updateHeader();

    var el = document.getElementById('dash-content');
    el.innerHTML = '<div class="dash-loading">Loading...</div>';

    try {
      switch (section) {
        case 'profile':     await renderProfile(el); break;
        case 'submissions': await renderSubmissions(el); break;
        case 'submit':      await renderSubmit(el); break;
        case 'review':      await renderReview(el); break;
        case 'content':     await renderContent(el); break;
        case 'users':       await renderUsers(el); break;
        case 'audit':       await renderAudit(el); break;
        case 'settings':    await renderSettings(el); break;
        default:
          if (_user.role === 'admin' || _user.role === 'curator') { await renderProfile(el); }
          else { await renderProfile(el); }
      }
    } catch (e) {
      el.innerHTML = '<div class="dash-error"><h2>Error</h2><p>' + esc(e.error || e.message || 'Something went wrong') + '</p></div>';
    }
  }

  function updateHeader() {
    var titles = {
      profile: 'My Profile',
      submissions: 'My Submissions',
      submit: 'Submit Content',
      review: 'Review Queue',
      content: 'Content Manager',
      users: 'Users',
      audit: 'Audit Log',
      settings: 'Settings',
    };
    document.getElementById('dash-page-title').textContent = titles[_currentSection] || 'Dashboard';
    document.getElementById('dash-page-subtitle').textContent = '';
  }

  // ─────────────────────────────────────
  //  SECTION: PROFILE
  // ─────────────────────────────────────

  async function renderProfile(el) {
    var data;
    try {
      data = await USC_API.request('user.php?action=profile');
    } catch (e) {
      data = { user: _user };
    }
    var u = data.user || _user;

    var html = '';
    // Preview card
    html += '<div class="dash-preview">';
    if (u.avatar_url) {
      html += '<div class="dash-preview-avatar">';
      html += '<img src="' + esc(u.avatar_url) + '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
      html += '</div>';
    } else {
      html += '<div class="dash-preview-avatar">' + icon('user', 32) + '</div>';
    }
    html += '<div class="dash-preview-name">' + esc(u.name) + '</div>';
    html += '<div class="dash-preview-email">' + esc(u.email) + '</div>';
    html += '<div class="dash-preview-meta">';
    if (u.location) html += '<span>' + esc(u.location) + '</span>';
    html += '<span>Role: ' + esc(u.role) + '</span>';
    html += '</div>';
    if (u.interests) {
      html += '<div class="dash-preview-tags">';
      u.interests.split(',').forEach(function (t) {
        html += '<span>' + esc(t.trim()) + '</span>';
      });
      html += '</div>';
    }
    if (u.website) html += '<a href="' + esc(u.website) + '" class="dash-preview-link" target="_blank">Visit Website</a>';
    if (u.affiliations && u.affiliations.length) {
      html += '<div class="dash-preview-tags">';
      u.affiliations.forEach(function (a) {
        html += '<span>' + esc(a.acronym || a.name) + '</span>';
      });
      html += '</div>';
    }
    if (u.connections && u.connections.length) {
      html += '<div class="dash-preview-tags" style="margin-top:4px">';
      u.connections.forEach(function (c) {
        html += '<span>' + esc(c.type) + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';

    // Edit form — reordered for UX flow
    html += '<div class="dash-section">';
    html += '<div class="dash-section-title">' + icon('edit', 18) + ' Edit Profile</div>';
    html += '<form id="dash-profile-form" class="dash-admin-form">';
    html += '<div id="dash-profile-msg" class="dash-msg"></div>';
    html += '<div class="dash-admin-form-grid">';
    // Row 1: Name, Email, Location
    html += fieldGroup('name', 'Name', 'text', u.name, true);
    html += fieldGroup('email', 'Email', 'email', u.email, true);
    html += fieldGroup('location', 'Location', 'text', u.location);
    // Row 2: Bio (full width)
    html += '<div class="dash-admin-form-group dash-admin-form-full">';
    html += '<label>Bio</label>';
    html += '<textarea id="field-bio" rows="3">' + esc(u.bio || '') + '</textarea>';
    html += '</div>';
    // Row 3: Profile Picture (full width)
    html += '<div class="dash-admin-form-group dash-admin-form-full">';
    html += '<label>Profile Picture</label>';
    html += '<div style="display:flex;align-items:center;gap:16px">';
    html += '<div id="avatar-preview" style="width:64px;height:64px;border-radius:50%;border:2px solid var(--border);overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--bg)">';
    if (u.avatar_url) {
      html += '<img src="' + esc(u.avatar_url) + '" style="width:100%;height:100%;object-fit:cover">';
    } else {
      html += icon('user', 28);
    }
    html += '</div>';
    html += '<div>';
    html += '<input type="file" id="field-avatar-file" accept="image/jpeg,image/png,image/webp" style="font-size:0.82rem;color:var(--text-2)">';
    html += '<input type="hidden" id="field-avatar_url" value="' + esc(u.avatar_url || '') + '">';
    html += '<button type="button" class="dash-btn dash-btn--outline dash-btn--sm" id="upload-avatar-btn" style="margin-top:8px">' + icon('upload', 14) + ' Upload</button>';
    html += '<div id="avatar-upload-msg" style="font-size:0.75rem;margin-top:4px"></div>';
    html += '</div></div></div>';
    // Row 4: Social Links (grouped)
    html += fieldGroup('website', 'Website', 'url', u.website);
    html += fieldGroup('twitter', 'Twitter', 'text', u.twitter);
    html += fieldGroup('linkedin', 'LinkedIn', 'text', u.linkedin);
    // Row 5: Interests (full width)
    html += '<div class="dash-admin-form-group dash-admin-form-full">';
    html += '<label>Interests</label>';
    html += '<input type="hidden" id="field-interests" value="' + esc(u.interests || '') + '">';
    html += '<div class="dash-tags-input" id="dash-tags-interests">';
    html += '<div class="dash-tags-list" id="interests-tags"></div>';
    html += '<input type="text" id="field-interests-input" placeholder="Type to add interests..." class="dash-input" style="flex:1;min-width:120px;border:none;box-shadow:none">';
    html += '</div>';
    html += '<small>Press Enter or comma to add. Suggestions: Astronomy, Satellite Tech, Earth Observation, STEM Education, Policy, Rocketry, Data Science</small>';
    html += '</div>';
    html += '</div>';
    html += '<div class="dash-admin-form-actions">';
    html += '<button type="submit" class="dash-btn dash-btn--gold">' + icon('check', 16) + ' Save Profile</button>';
    html += '</div></form>';
    html += '</div>';

    // Affiliations
    html += '<div class="dash-section">';
    html += '<div class="dash-section-title">' + icon('users', 18) + ' Affiliations</div>';
    html += '<div id="dash-affiliations-list" class="dash-sub-grid"></div>';
    html += '<button type="button" class="dash-btn dash-btn--outline dash-btn--sm" id="add-affiliation-btn" style="margin-top:12px">' + icon('plus', 14) + ' Add Affiliation</button>';
    html += '</div>';

    // Connections
    html += '<div class="dash-section">';
    html += '<div class="dash-section-title">' + icon('link', 18) + ' Connections</div>';
    html += '<div id="dash-connections-list" class="dash-sub-grid"></div>';
    html += '<button type="button" class="dash-btn dash-btn--outline dash-btn--sm" id="add-connection-btn" style="margin-top:12px">' + icon('plus', 14) + ' Add Connection</button>';
    html += '</div>';

    // Password change — last (security, least frequent)
    html += '<div class="dash-section dash-password-section">';
    html += '<div class="dash-section-title">' + icon('settings', 18) + ' Change Password</div>';
    html += '<form id="dash-pass-form" class="dash-admin-form">';
    html += '<div id="dash-pass-msg" class="dash-msg"></div>';
    html += '<div class="dash-admin-form-grid">';
    html += fieldGroup('current_password', 'Current Password', 'password', '', true);
    html += fieldGroup('new_password', 'New Password', 'password', '', true);
    html += '</div>';
    html += '<div class="dash-admin-form-actions">';
    html += '<button type="submit" class="dash-btn dash-btn--gold">' + icon('check', 16) + ' Update Password</button>';
    html += '</div></form>';
    html += '</div>';

    el.innerHTML = html;

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

    // Init affiliations
    var affList = document.getElementById('dash-affiliations-list');
    var affiliations = u.affiliations || [];

    function renderAffiliations() {
      if (!affiliations.length) {
        affiliations = [{name:'',acronym:'',role:''}];
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

    // Bind avatar upload
    var uploadBtn = document.getElementById('upload-avatar-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', async function() {
        var fileInput = document.getElementById('field-avatar-file');
        var msg = document.getElementById('avatar-upload-msg');
        var file = fileInput.files[0];
        if (!file) { msg.textContent = 'Choose an image first.'; msg.style.color = 'var(--text-3)'; return; }
        if (file.size > 5 * 1024 * 1024) { msg.textContent = 'Max 5MB.'; msg.style.color = 'var(--red)'; return; }
        msg.textContent = 'Uploading...'; msg.style.color = 'var(--text-3)';
        uploadBtn.disabled = true;
        try {
          var formData = new FormData();
          formData.append('image', file);
          var resp = await USC_API.request('upload.php', { method: 'POST', body: formData, isForm: true });
          document.getElementById('field-avatar_url').value = resp.url;
          var preview = document.getElementById('avatar-preview');
          preview.innerHTML = '<img src="' + esc(resp.url) + '" style="width:100%;height:100%;object-fit:cover">';
          msg.textContent = 'Uploaded!'; msg.style.color = 'var(--emerald)';
        } catch (e) {
          msg.textContent = e.error || 'Upload failed.'; msg.style.color = 'var(--red)';
        }
        uploadBtn.disabled = false;
      });
    }

    // Bind profile save
    document.getElementById('dash-profile-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = document.getElementById('dash-profile-msg');
      var payload = {};
      ['name','email','location','website','interests','twitter','linkedin','bio','avatar_url'].forEach(function (k) {
        var f = document.getElementById('field-' + k);
        if (f) payload[k] = f.value.trim();
      });
      payload.affiliations = affiliations.filter(function(a) { return a.name.trim(); });
      payload.connections = connections.filter(function(c) { return c.url.trim(); });
      try {
        await USC_API.request('user.php?action=update-profile', { method: 'POST', body: payload });
        msg.className = 'dash-msg show success';
        msg.textContent = 'Profile saved.';
        // Update cached user
        _user.name = payload.name;
        _user.email = payload.email;
        localStorage.setItem('usc-user', JSON.stringify(_user));
      } catch (e) {
        msg.className = 'dash-msg show error';
        msg.textContent = e.error || 'Save failed.';
      }
    });

    // Bind password change
    document.getElementById('dash-pass-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = document.getElementById('dash-pass-msg');
      var cur = document.getElementById('field-current_password').value;
      var np = document.getElementById('field-new_password').value;
      if (!cur || !np) { msg.className = 'dash-msg show error'; msg.textContent = 'Fill in both fields.'; return; }
      try {
        await USC_API.request('user.php?action=change-password', { method: 'POST', body: { current_password: cur, new_password: np } });
        msg.className = 'dash-msg show success';
        msg.textContent = 'Password updated.';
        document.getElementById('field-current_password').value = '';
        document.getElementById('field-new_password').value = '';
      } catch (e) {
        msg.className = 'dash-msg show error';
        msg.textContent = e.error || 'Update failed.';
      }
    });
  }

  function fieldGroup(name, label, type, value, required, help) {
    var html = '<div class="dash-admin-form-group">';
    html += '<label>' + esc(label) + (required ? ' <span class="required">*</span>' : '') + '</label>';
    html += '<input type="' + type + '" id="field-' + name + '" value="' + esc(value || '') + '"' + (required ? ' required' : '') + '>';
    if (help) html += '<small>' + esc(help) + '</small>';
    html += '</div>';
    return html;
  }

  // ─────────────────────────────────────
  //  SECTION: MY SUBMISSIONS
  // ─────────────────────────────────────

  async function renderSubmissions(el) {
    var data = await USC_API.mySubmissions();
    var subs = data.submissions || [];

    var html = '<div class="dash-sub-filters">';
    html += '<button class="dash-sub-filter-btn active" data-filter="all">All</button>';
    ['event','program','project','organization','news','article','opportunity'].forEach(function (t) {
      html += '<button class="dash-sub-filter-btn" data-filter="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + 's</button>';
    });
    html += '</div>';

    html += '<div class="dash-sub-grid" id="dash-sub-grid">';
    if (subs.length === 0) {
      html += '<div class="dash-sub-empty">No submissions yet. <a href="#submit" class="dash-link">Submit something</a></div>';
    } else {
      subs.forEach(function (s) {
        var p = s.payload || {};
        var title = p.title || p.name || p.question || '(untitled)';
        html += '<div class="dash-sub-card" data-type="' + esc(s.type) + '">';
        html += '<div class="dash-sub-card-top">';
        html += '<span class="dash-sub-type-badge">' + esc(s.type) + '</span>';
        html += statusBadge(s.status);
        html += '</div>';
        html += '<h4>' + esc(title) + '</h4>';
        html += '<div class="sub-date">' + formatDate(s.created_at) + '</div>';
        if (s.status === 'rejected' && s.review_note) {
          html += '<div class="sub-note"><strong>Rejection note:</strong> ' + esc(s.review_note) + '</div>';
        }
        if (s.status === 'pending') {
          html += '<div class="dash-sub-card-actions">';
          html += '<button class="dash-btn-sm dash-btn-red-sm" onclick="USC_DASH.deleteSub(' + s.id + ')">' + icon('trash', 12) + ' Delete</button>';
          html += '</div>';
        }
        html += '</div>';
      });
    }
    html += '</div>';

    el.innerHTML = html;

    // Filter buttons
    el.querySelectorAll('.dash-sub-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        el.querySelectorAll('.dash-sub-filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.dataset.filter;
        el.querySelectorAll('.dash-sub-card').forEach(function (card) {
          card.style.display = (filter === 'all' || card.dataset.type === filter) ? '' : 'none';
        });
      });
    });
  }

  async function deleteSub(id) {
    if (!confirm('Delete this submission?')) return;
    try {
      await USC_API.request('submissions.php?action=delete', { method: 'POST', body: { id: id } });
      handleRoute();
    } catch (e) {
      alert(e.error || 'Delete failed');
    }
  }

  // ─────────────────────────────────────
  //  SECTION: SUBMIT CONTENT
  // ─────────────────────────────────────

  async function renderSubmit(el) {
    var html = '<div class="dash-submit-type">';
    html += '<label>Content Type</label>';
    html += '<select id="dash-submit-type">';
    SUBMISSION_TYPES.forEach(function (t) {
      html += '<option value="' + t.value + '">' + t.label + '</option>';
    });
    html += '</select></div>';

    html += '<div id="dash-submit-form-wrap">';
    html += renderSubmitForm('event');
    html += '</div>';
    html += '<div id="dash-submit-msg" class="dash-msg"></div>';

    el.innerHTML = html;

    // Type change
    document.getElementById('dash-submit-type').addEventListener('change', function () {
      document.getElementById('dash-submit-form-wrap').innerHTML = renderSubmitForm(this.value);
      bindSubmitForm();
      initSubmitQuill();
    });
    bindSubmitForm();
    initSubmitQuill();
  }

  function initSubmitQuill() {
    setTimeout(function() {
      if (typeof Quill !== 'undefined' && document.getElementById('quill-content')) {
        window._dashQuill = new Quill('#quill-content', {
          theme: 'snow',
          placeholder: 'Write your article content here...',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'code-block'],
              ['link', 'image'],
              ['clean']
            ]
          }
        });
      }
    }, 100);
  }

  function renderSubmitForm(type) {
    var fields = getSubmitFields(type);
    var html = '<form id="dash-submit-form" class="dash-admin-form"><div class="dash-admin-form-grid">';
    fields.forEach(function (f) {
      var span = (f.type === 'textarea' || f.type === 'quill') ? ' dash-admin-form-full' : '';
      html += '<div class="dash-admin-form-group' + span + '">';
      html += '<label>' + esc(f.label) + (f.required ? ' <span class="required">*</span>' : '') + '</label>';
      if (f.type === 'quill') {
        html += '<div class="dash-quill-wrap">';
        html += '<div id="quill-' + f.name + '"></div>';
        html += '</div>';
      } else if (f.type === 'textarea') {
        html += '<textarea id="sub-' + f.name + '" rows="' + (f.tall ? 6 : 4) + '"' + (f.required ? ' required' : '') + '></textarea>';
      } else if (f.type === 'select') {
        html += '<select id="sub-' + f.name + '"' + (f.required ? ' required' : '') + '>';
        html += '<option value="">Select...</option>';
        (f.options || []).forEach(function (o) {
          html += '<option value="' + esc(o.value) + '">' + esc(o.label) + '</option>';
        });
        html += '</select>';
      } else {
        html += '<input type="' + f.type + '" id="sub-' + f.name + '"' + (f.required ? ' required' : '') + '>';
      }
      if (f.help) html += '<small>' + esc(f.help) + '</small>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="dash-admin-form-actions">';
    html += '<button type="submit" class="dash-btn dash-btn--gold">' + icon('check', 16) + ' Submit for Review</button>';
    html += '</div></form>';
    return html;
  }

  function getSubmitFields(type) {
    var map = {
      event: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'description', label:'Description', type:'textarea' },
        { name:'date', label:'Date', type:'date', required:true },
        { name:'location', label:'Location', type:'text' },
        { name:'category', label:'Category', type:'select', options:[
          {value:'Physical',label:'Physical'},{value:'Virtual',label:'Virtual'},
          {value:'Workshop',label:'Workshop'},{value:'Competition',label:'Competition'}
        ]},
        { name:'status', label:'Status', type:'select', options:[
          {value:'planned',label:'Planned'},{value:'proposed',label:'Proposed'}
        ]},
      ],
      program: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'description', label:'Description', type:'textarea' },
        { name:'start', label:'Start Date', type:'date' },
        { name:'end', label:'End Date', type:'date' },
        { name:'tags', label:'Tags', type:'text', help:'Comma-separated' },
        { name:'status', label:'Status', type:'select', options:[
          {value:'active',label:'Active'},{value:'planned',label:'Planned'},{value:'proposed',label:'Proposed'}
        ]},
      ],
      project: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'description', label:'Description', type:'textarea' },
        { name:'status', label:'Status', type:'select', options:[
          {value:'Active',label:'Active'},{value:'Completed',label:'Completed'}
        ]},
        { name:'tags', label:'Tags', type:'text', help:'Comma-separated' },
      ],
      organization: [
        { name:'name', label:'Name', type:'text', required:true },
        { name:'type', label:'Type', type:'select', options:[
          {value:'University',label:'University'},{value:'Agency',label:'Agency'},
          {value:'NGO',label:'NGO'},{value:'Innovation Hub',label:'Innovation Hub'},
          {value:'Government',label:'Government'},{value:'Other',label:'Other'}
        ]},
        { name:'description', label:'Description', type:'textarea' },
        { name:'website', label:'Website', type:'url' },
        { name:'location', label:'Location', type:'text' },
      ],
      news: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'author', label:'Author', type:'text' },
        { name:'category', label:'Category', type:'select', options:[
          {value:'Policy',label:'Policy'},{value:'University',label:'University'},
          {value:'Infrastructure',label:'Infrastructure'},{value:'General',label:'General'}
        ]},
        { name:'summary', label:'Summary', type:'textarea' },
      ],
      article: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'author', label:'Author', type:'text' },
        { name:'category', label:'Category', type:'select', options:[
          {value:'Analysis',label:'Analysis'},{value:'Tutorial',label:'Tutorial'},
          {value:'Opinion',label:'Opinion'},{value:'Research',label:'Research'}
        ]},
        { name:'summary', label:'Summary', type:'textarea' },
        { name:'content', label:'Content', type:'quill', tall:true },
      ],
      opportunity: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'type', label:'Type', type:'select', options:[
          {value:'Scholarship',label:'Scholarship'},{value:'Internship',label:'Internship'},
          {value:'Grant',label:'Grant'},{value:'Fellowship',label:'Fellowship'}
        ]},
        { name:'deadline', label:'Deadline', type:'date' },
        { name:'description', label:'Description', type:'textarea' },
        { name:'link', label:'Link URL', type:'url' },
      ],
    };
    return map[type] || [];
  }

  function bindSubmitForm() {
    var form = document.getElementById('dash-submit-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = document.getElementById('dash-submit-msg');
      var type = document.getElementById('dash-submit-type').value;
      var fields = getSubmitFields(type);
      var payload = {};
      // Get Quill content if available
      if (window._dashQuill) {
        var content = window._dashQuill.getText().trim();
        if (content) payload.content = window._dashQuill.root.innerHTML;
      }
      var valid = true;
      fields.forEach(function (f) {
        var el = document.getElementById('sub-' + f.name);
        if (!el) return;
        var val = el.value.trim();
        if (f.required && !val) { valid = false; el.focus(); }
        payload[f.name] = val;
      });
      if (!valid) { msg.className = 'dash-msg show error'; msg.textContent = 'Please fill in required fields.'; return; }
      try {
        await USC_API.submit(type, payload);
        msg.className = 'dash-msg show success';
        msg.textContent = 'Submitted for review!';
        form.reset();
      } catch (e) {
        msg.className = 'dash-msg show error';
        msg.textContent = e.error || 'Submission failed.';
      }
    });
  }

  // ─────────────────────────────────────
  //  SECTION: REVIEW QUEUE
  // ─────────────────────────────────────

  async function renderReview(el) {
    if (_user.role !== 'curator' && _user.role !== 'admin') {
      el.innerHTML = '<div class="dash-access-denied"><h2>Access Denied</h2><p>Curators and admins only.</p></div>';
      return;
    }
    var data = await USC_API.request('admin.php?action=list&status=pending&limit=50');
    var records = data.records || [];

    var html = '<div class="dash-header-row">';
    html += '<h2>Review Queue <span class="dash-count">' + data.total + ' pending</span></h2>';
    html += '<div class="dash-header-actions">';
    html += '<select id="review-type-filter" class="dash-select">';
    html += '<option value="">All Types</option>';
    ['event','program','project','organization','news','article','opportunity'].forEach(function (t) {
      html += '<option value="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + 's</option>';
    });
    html += '</select>';
    html += '<button id="review-bulk-approve" class="dash-btn dash-btn--green dash-btn--sm">' + icon('check', 14) + ' Approve Selected</button>';
    html += '<button id="review-bulk-reject" class="dash-btn dash-btn--red dash-btn--sm">' + icon('x', 14) + ' Reject Selected</button>';
    html += '</div></div>';

    if (records.length === 0) {
      html += '<div class="dash-empty-state"><p>No pending submissions. All clear!</p></div>';
      el.innerHTML = html;
      return;
    }

    records.forEach(function (rec) {
      var p = rec.payload || {};
      var title = p.title || p.name || p.question || '(untitled)';
      html += '<div class="dash-review-card" data-id="' + rec.id + '">';
      html += '<div class="dash-review-header">';
      html += '<label class="dash-checkbox"><input type="checkbox" class="review-select" value="' + rec.id + '"></label>';
      html += typeBadge(rec.type);
      html += '<strong>' + esc(title) + '</strong>';
      html += '<span class="dash-review-meta">by ' + esc(rec.author_name || 'Anonymous') + ' · ' + formatDate(rec.created_at) + '</span>';
      html += '</div>';
      html += '<div class="dash-review-payload">';
      for (var k in p) {
        if (k === 'title' || k === 'name') continue;
        var v = p[k];
        if (v && String(v).length > 200) v = String(v).substring(0, 200) + '...';
        html += '<div class="dash-review-field"><span class="dash-review-key">' + esc(k) + ':</span> ' + esc(v || '—') + '</div>';
      }
      html += '</div>';
      html += '<div class="dash-review-actions">';
      html += '<input type="text" class="dash-input dash-review-note" placeholder="Review note (optional)">';
      html += '<button class="dash-btn dash-btn--green dash-btn--sm review-approve" data-id="' + rec.id + '">' + icon('check', 14) + ' Approve</button>';
      html += '<button class="dash-btn dash-btn--red dash-btn--sm review-reject" data-id="' + rec.id + '">' + icon('x', 14) + ' Reject</button>';
      html += '</div></div>';
    });

    el.innerHTML = html;

    // Bind approve/reject
    el.querySelectorAll('.review-approve').forEach(function (btn) {
      btn.addEventListener('click', function () { reviewOne(parseInt(btn.dataset.id), 'approved'); });
    });
    el.querySelectorAll('.review-reject').forEach(function (btn) {
      btn.addEventListener('click', function () { reviewOne(parseInt(btn.dataset.id), 'rejected'); });
    });
    document.getElementById('review-bulk-approve').addEventListener('click', function () { bulkReview('approved'); });
    document.getElementById('review-bulk-reject').addEventListener('click', function () { bulkReview('rejected'); });
  }

  async function reviewOne(id, status) {
    var card = document.querySelector('.dash-review-card[data-id="' + id + '"]');
    var note = card ? card.querySelector('.dash-review-note').value : '';
    try {
      await USC_API.request('admin.php', { method:'POST', body:{ action:'review', id:id, status:status, note:note } });
      card.remove();
    } catch (e) { alert(e.error || 'Review failed'); }
  }

  async function bulkReview(status) {
    var checks = document.querySelectorAll('.review-select:checked');
    var ids = Array.from(checks).map(function (c) { return parseInt(c.value); });
    if (ids.length === 0) { alert('Select submissions first.'); return; }
    try {
      await USC_API.request('admin.php', { method:'POST', body:{ action:'bulk-review', ids:ids, status:status } });
      ids.forEach(function (id) {
        var card = document.querySelector('.dash-review-card[data-id="' + id + '"]');
        if (card) card.remove();
      });
    } catch (e) { alert(e.error || 'Bulk review failed'); }
  }

  // ─────────────────────────────────────
  //  SECTION: CONTENT MANAGER
  // ─────────────────────────────────────

  async function renderContent(el) {
    if (_user.role !== 'curator' && _user.role !== 'admin') {
      el.innerHTML = '<div class="dash-access-denied"><h2>Access Denied</h2></div>';
      return;
    }

    var html = '<div class="dash-header-row">';
    html += '<h2>Content Manager</h2>';
    html += '<div class="dash-header-actions">';
    html += '<select id="content-type-select" class="dash-select">';
    CONTENT_TYPES.forEach(function (ct) {
      html += '<option value="' + ct.slug + '">' + ct.label + '</option>';
    });
    html += '</select>';
    html += '<div class="dash-search">' + icon('search', 16) + '<input type="text" placeholder="Search..." id="content-search"></div>';
    html += '<button id="content-new-btn" class="dash-btn dash-btn--gold dash-btn--sm">' + icon('plus', 14) + ' New</button>';
    html += '</div></div>';
    html += '<div id="content-table-wrap"></div>';

    el.innerHTML = html;

    document.getElementById('content-type-select').addEventListener('change', function () { loadContentTable(this.value); });
    document.getElementById('content-new-btn').addEventListener('click', function () { showContentForm(document.getElementById('content-type-select').value, null); });
    document.getElementById('content-search').addEventListener('input', function () { loadContentTable(document.getElementById('content-type-select').value, this.value); });

    loadContentTable('events');
  }

  async function loadContentTable(slug, search) {
    var wrap = document.getElementById('content-table-wrap');
    wrap.innerHTML = '<div class="dash-loading">Loading...</div>';
    var params = 'action=list&type=' + slug + '&limit=50';
    if (search) params += '&search=' + encodeURIComponent(search);
    var data = await USC_API.request('admin.php?' + params);
    var records = data.records || [];

    if (records.length === 0) {
      wrap.innerHTML = '<div class="dash-empty-state">No records found.</div>';
      return;
    }

    var html = '<div class="dash-table-wrap"><table class="dash-table">';
    html += '<thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
    records.forEach(function (r) {
      var title = r.title || r.name || '—';
      html += '<tr>';
      html += '<td class="dash-table-mono">' + r.id + '</td>';
      html += '<td>' + esc(String(title).substring(0, 60)) + '</td>';
      html += '<td>' + statusBadge(r.status || 'approved') + '</td>';
      html += '<td>' + formatDate(r.created_at || r.date) + '</td>';
      html += '<td class="dash-actions">';
      html += '<button class="dash-action-btn content-edit" data-id="' + r.id + '" data-type="' + esc(slug) + '" title="Edit">' + icon('edit', 14) + '</button>';
      html += '<button class="dash-action-btn dash-action-btn--red content-delete" data-id="' + r.id + '" title="Delete">' + icon('trash', 14) + '</button>';
      html += '</td></tr>';
    });
    html += '</tbody></table></div>';
    wrap.innerHTML = html;

    wrap.querySelectorAll('.content-edit').forEach(function (btn) {
      btn.addEventListener('click', function () { showContentForm(btn.dataset.type, parseInt(btn.dataset.id)); });
    });
    wrap.querySelectorAll('.content-delete').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (!confirm('Delete this record?')) return;
        try {
          await USC_API.request('admin.php', { method:'POST', body:{ action:'delete', id:parseInt(btn.dataset.id) } });
          loadContentTable(slug, search);
        } catch (e) { alert(e.error || 'Delete failed'); }
      });
    });
  }

  async function showContentForm(slug, id) {
    var ct = CONTENT_TYPES.find(function (c) { return c.slug === slug; });
    if (!ct) return;
    var record = null;
    if (id) {
      try { record = await USC_API.request('admin.php?action=get&id=' + id); } catch (e) {}
    }
    var wrap = document.getElementById('content-table-wrap');
    var fields = getContentFields(ct.type);
    var payload = record ? (record.payload || record) : {};

    var html = '<div class="dash-admin-form">';
    html += '<div class="dash-header-row"><h2>' + (id ? 'Edit' : 'New') + ' ' + esc(ct.singular) + '</h2>';
    html += '<button class="dash-btn dash-btn--outline dash-btn--sm" id="content-cancel-btn">' + icon('chevron-left', 14) + ' Back</button></div>';
    html += '<div class="dash-admin-form-grid">';
    fields.forEach(function (f) {
      var val = payload[f.name] || '';
      var span = (f.type === 'textarea' || f.type === 'quill') ? ' dash-admin-form-full' : '';
      html += '<div class="dash-admin-form-group' + span + '">';
      html += '<label>' + esc(f.label) + (f.required ? ' <span class="required">*</span>' : '') + '</label>';
      if (f.type === 'quill') {
        html += '<div class="dash-quill-wrap">';
        html += '<div id="quill-' + f.name + '"></div>';
        html += '</div>';
      } else if (f.type === 'textarea') {
        html += '<textarea id="cf-' + f.name + '" rows="' + (f.tall ? 6 : 4) + '">' + esc(val) + '</textarea>';
      } else if (f.type === 'select') {
        html += '<select id="cf-' + f.name + '">';
        html += '<option value="">Select...</option>';
        (f.options || []).forEach(function (o) {
          html += '<option value="' + esc(o.value) + '"' + (val === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
        });
        html += '</select>';
      } else {
        html += '<input type="' + f.type + '" id="cf-' + f.name + '" value="' + esc(val) + '">';
      }
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="dash-admin-form-actions">';
    html += '<button class="dash-btn dash-btn--gold" id="content-save-btn">' + icon('check', 16) + ' Save</button>';
    html += '</div></div>';

    wrap.innerHTML = html;

    // Init Quill if content field present
    setTimeout(function() {
      if (typeof Quill !== 'undefined' && document.getElementById('quill-content')) {
        window._dashContentQuill = new Quill('#quill-content', {
          theme: 'snow',
          placeholder: 'Write your article content here...',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'code-block'],
              ['link', 'image'],
              ['clean']
            ]
          }
        });
        if (payload.content) {
          window._dashContentQuill.root.innerHTML = payload.content;
        }
      }
    }, 100);

    document.getElementById('content-cancel-btn').addEventListener('click', function () { loadContentTable(slug); });
    document.getElementById('content-save-btn').addEventListener('click', async function () {
      var payload = {};
      // Get Quill content if available
      if (window._dashContentQuill) {
        var content = window._dashContentQuill.getText().trim();
        if (content) payload.content = window._dashContentQuill.root.innerHTML;
      }
      fields.forEach(function (f) {
        var el = document.getElementById('cf-' + f.name);
        if (el) payload[f.name] = el.value.trim();
      });
      try {
        if (id) {
          await USC_API.request('admin.php', { method:'POST', body:{ action:'update', id:id, payload:payload } });
        } else {
          await USC_API.request('admin.php', { method:'POST', body:{ action:'create', type:ct.type, payload:payload } });
        }
        loadContentTable(slug);
      } catch (e) { alert(e.error || 'Save failed'); }
    });
  }

  function getContentFields(type) {
    var map = {
      event: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'date', label:'Date', type:'date' },
        { name:'location', label:'Location', type:'text' },
        { name:'category', label:'Category', type:'select', options:[
          {value:'Physical',label:'Physical'},{value:'Virtual',label:'Virtual'},
          {value:'Workshop',label:'Workshop'},{value:'Competition',label:'Competition'}
        ]},
        { name:'description', label:'Description', type:'textarea' },
      ],
      program: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'description', label:'Description', type:'textarea' },
        { name:'start', label:'Start', type:'date' },
        { name:'end', label:'End', type:'date' },
        { name:'status', label:'Status', type:'select', options:[
          {value:'active',label:'Active'},{value:'completed',label:'Completed'},
          {value:'planned',label:'Planned'},{value:'proposed',label:'Proposed'}
        ]},
      ],
      project: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'description', label:'Description', type:'textarea' },
        { name:'status', label:'Status', type:'select', options:[
          {value:'Active',label:'Active'},{value:'Completed',label:'Completed'}
        ]},
      ],
      organization: [
        { name:'name', label:'Name', type:'text', required:true },
        { name:'type', label:'Type', type:'select', options:[
          {value:'University',label:'University'},{value:'Agency',label:'Agency'},
          {value:'NGO',label:'NGO'},{value:'Innovation Hub',label:'Innovation Hub'},
          {value:'Government',label:'Government'},{value:'Other',label:'Other'}
        ]},
        { name:'description', label:'Description', type:'textarea' },
        { name:'website', label:'Website', type:'url' },
        { name:'location', label:'Location', type:'text' },
      ],
      news: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'author', label:'Author', type:'text' },
        { name:'category', label:'Category', type:'select', options:[
          {value:'Policy',label:'Policy'},{value:'University',label:'University'},
          {value:'Infrastructure',label:'Infrastructure'},{value:'General',label:'General'}
        ]},
        { name:'summary', label:'Summary', type:'textarea' },
      ],
      article: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'author', label:'Author', type:'text' },
        { name:'category', label:'Category', type:'select', options:[
          {value:'Analysis',label:'Analysis'},{value:'Tutorial',label:'Tutorial'},
          {value:'Opinion',label:'Opinion'},{value:'Research',label:'Research'}
        ]},
        { name:'summary', label:'Summary', type:'textarea' },
        { name:'content', label:'Content', type:'quill', tall:true },
      ],
      opportunity: [
        { name:'title', label:'Title', type:'text', required:true },
        { name:'type', label:'Type', type:'select', options:[
          {value:'Scholarship',label:'Scholarship'},{value:'Internship',label:'Internship'},
          {value:'Grant',label:'Grant'},{value:'Fellowship',label:'Fellowship'}
        ]},
        { name:'deadline', label:'Deadline', type:'date' },
        { name:'description', label:'Description', type:'textarea' },
        { name:'link', label:'Link URL', type:'url' },
      ],
    };
    return map[type] || [];
  }

  // ─────────────────────────────────────
  //  SECTION: USERS (admin)
  // ─────────────────────────────────────

  async function renderUsers(el) {
    if (_user.role !== 'admin') {
      el.innerHTML = '<div class="dash-access-denied"><h2>Access Denied</h2><p>Admin only.</p></div>';
      return;
    }

    var html = '<div class="dash-header-row">';
    html += '<h2>Users <span class="dash-count" id="users-count">—</span></h2>';
    html += '<div class="dash-header-actions">';
    html += '<div class="dash-search">' + icon('search', 16) + '<input type="text" placeholder="Search users..." id="users-search"></div>';
    html += '<select id="users-role-filter" class="dash-select">';
    html += '<option value="">All Roles</option>';
    html += '<option value="member">Member</option>';
    html += '<option value="curator">Curator</option>';
    html += '<option value="admin">Admin</option>';
    html += '</select>';
    html += '</div></div>';
    html += '<div id="users-table-wrap"></div>';

    el.innerHTML = html;
    loadUsersTable();

    document.getElementById('users-search').addEventListener('input', function () { loadUsersTable(this.value, document.getElementById('users-role-filter').value); });
    document.getElementById('users-role-filter').addEventListener('change', function () { loadUsersTable(document.getElementById('users-search').value, this.value); });
  }

  async function loadUsersTable(search, roleFilter) {
    var wrap = document.getElementById('users-table-wrap');
    wrap.innerHTML = '<div class="dash-loading">Loading...</div>';
    var params = 'action=users&limit=50';
    if (search) params += '&search=' + encodeURIComponent(search);
    var data = await USC_API.request('admin.php?' + params);
    var users = data.users || [];

    if (roleFilter) {
      users = users.filter(function (u) { return u.role === roleFilter; });
    }

    var countEl = document.getElementById('users-count');
    if (countEl) countEl.textContent = users.length;

    var html = '<div class="dash-table-wrap"><table class="dash-table">';
    html += '<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>';
    users.forEach(function (u) {
      html += '<tr>';
      html += '<td class="dash-table-mono">' + u.id + '</td>';
      html += '<td>' + esc(u.name) + '</td>';
      html += '<td>' + esc(u.email) + '</td>';
      html += '<td><select class="dash-select dash-select-sm user-role-sel" data-uid="' + u.id + '">';
      ['member','curator','admin'].forEach(function (r) {
        html += '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r + '</option>';
      });
      html += '</select></td>';
      html += '<td>' + statusBadge(u.status) + '</td>';
      html += '<td>' + formatDate(u.created_at) + '</td>';
      html += '<td class="dash-actions">';
      html += '<button class="dash-action-btn user-toggle" data-uid="' + u.id + '" title="' + (u.status === 'active' ? 'Suspend' : 'Unsuspend') + '">';
      html += icon(u.status === 'active' ? 'x' : 'check', 14) + '</button>';
      html += '</td></tr>';
    });
    html += '</tbody></table></div>';
    wrap.innerHTML = html;

    wrap.querySelectorAll('.user-role-sel').forEach(function (sel) {
      sel.addEventListener('change', async function () {
        try {
          await USC_API.request('admin.php', { method:'POST', body:{ action:'update-role', user_id:parseInt(sel.dataset.uid), role:sel.value } });
        } catch (e) { alert(e.error || 'Failed'); loadUsersTable(search, roleFilter); }
      });
    });
    wrap.querySelectorAll('.user-toggle').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        try {
          await USC_API.request('admin.php', { method:'POST', body:{ action:'toggle-status', user_id:parseInt(btn.dataset.uid) } });
          loadUsersTable(search, roleFilter);
        } catch (e) { alert(e.error || 'Failed'); }
      });
    });
  }

  // ─────────────────────────────────────
  //  SECTION: AUDIT LOG
  // ─────────────────────────────────────

  async function renderAudit(el) {
    if (_user.role !== 'curator' && _user.role !== 'admin') {
      el.innerHTML = '<div class="dash-access-denied"><h2>Access Denied</h2></div>';
      return;
    }

    var html = '<div class="dash-header-row">';
    html += '<h2>Audit Log <span class="dash-count" id="audit-count">\u2014</span></h2>';
    html += '<div class="dash-header-actions">';
    html += '<select id="audit-action-filter" class="dash-select">';
    html += '<option value="">All Actions</option>';
    html += '<option value="review">Review</option>';
    html += '<option value="role_change">Role Change</option>';
    html += '<option value="status_change">Status Change</option>';
    html += '<option value="delete">Delete</option>';
    html += '</select>';
    html += '</div></div>';
    html += '<div id="audit-table-wrap"></div>';
    el.innerHTML = html;

    loadAuditTable();
    document.getElementById('audit-action-filter').addEventListener('change', function() { loadAuditTable(this.value); });
  }

  async function loadAuditTable(actionFilter) {
    var wrap = document.getElementById('audit-table-wrap');
    wrap.innerHTML = '<div class="dash-loading">Loading...</div>';
    var params = 'action=list&limit=100';
    if (actionFilter) params += '&action_type=' + encodeURIComponent(actionFilter);
    try {
      var data = await USC_API.request('audit.php?' + params);
    } catch (e) {
      wrap.innerHTML = '<div class="dash-empty-state">Audit log not available yet.</div>';
      return;
    }
    var records = data.records || [];
    var countEl = document.getElementById('audit-count');
    if (countEl) countEl.textContent = data.total || records.length;

    if (records.length === 0) {
      wrap.innerHTML = '<div class="dash-empty-state">No audit entries found.</div>';
      return;
    }

    var html = '<div class="dash-table-wrap"><table class="dash-table">';
    html += '<thead><tr><th>Date</th><th>User</th><th>Action</th><th>Target</th><th>Details</th></tr></thead><tbody>';
    records.forEach(function(r) {
      html += '<tr>';
      html += '<td>' + formatDate(r.created_at) + '</td>';
      html += '<td>' + esc(r.user_name || 'System') + '</td>';
      html += '<td>' + typeBadge(r.action_type) + '</td>';
      html += '<td>' + esc((r.target_type || '') + (r.target_id ? ' #' + r.target_id : '')) + '</td>';
      html += '<td>' + esc(r.details || '\u2014') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    wrap.innerHTML = html;
  }

  // ─────────────────────────────────────
  //  SECTION: SETTINGS (admin)
  // ─────────────────────────────────────

  async function renderSettings(el) {
    if (_user.role !== 'admin') {
      el.innerHTML = '<div class="dash-access-denied"><h2>Access Denied</h2></div>';
      return;
    }

    var data;
    try { data = await USC_API.request('admin.php?action=settings'); } catch (e) { data = {}; }
    var s = data.settings || {};

    var keys = [
      { key:'tagline', label:'Tagline', type:'text' },
      { key:'contact_email', label:'Contact Email', type:'email' },
      { key:'contact_phone', label:'Contact Phone', type:'text' },
      { key:'address', label:'Address', type:'textarea' },
      { key:'twitter', label:'Twitter URL', type:'url' },
      { key:'linkedin', label:'LinkedIn URL', type:'url' },
      { key:'github', label:'GitHub URL', type:'url' },
      { key:'facebook', label:'Facebook URL', type:'url' },
    ];

    var html = '<form id="dash-settings-form" class="dash-admin-form">';
    html += '<div id="dash-settings-msg" class="dash-msg"></div>';
    html += '<div class="dash-admin-form-grid">';
    keys.forEach(function (k) {
      var span = (k.type === 'textarea') ? ' dash-admin-form-full' : '';
      html += '<div class="dash-admin-form-group' + span + '">';
      html += '<label>' + esc(k.label) + '</label>';
      if (k.type === 'textarea') {
        html += '<textarea id="setting-' + k.key + '" rows="3">' + esc(s[k.key] || '') + '</textarea>';
      } else {
        html += '<input type="' + k.type + '" id="setting-' + k.key + '" value="' + esc(s[k.key] || '') + '">';
      }
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="dash-admin-form-actions">';
    html += '<button type="submit" class="dash-btn dash-btn--gold">' + icon('check', 16) + ' Save Settings</button>';
    html += '</div></form>';

    el.innerHTML = html;

    document.getElementById('dash-settings-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = document.getElementById('dash-settings-msg');
      var payload = { action:'settings' };
      keys.forEach(function (k) {
        var f = document.getElementById('setting-' + k.key);
        if (f) payload[k.key] = f.value.trim();
      });
      try {
        await USC_API.request('admin.php', { method:'POST', body:payload });
        msg.className = 'dash-msg show success';
        msg.textContent = 'Settings saved.';
      } catch (e) {
        msg.className = 'dash-msg show error';
        msg.textContent = e.error || 'Save failed.';
      }
    });
  }

  // ─────────────────────────────────────
  //  INIT
  // ─────────────────────────────────────

  async function init() {
    // Auth guard
    _user = USC.getUser();
    if (!_user) { window.location.href = 'login'; return; }

    // Check server session
    try {
      var res = await USC_API.checkSession();
      if (res.user) {
        _user = res.user;
        localStorage.setItem('usc-user', JSON.stringify(_user));
      } else {
        window.location.href = 'login'; return;
      }
    } catch (e) {
      // API offline — use cached
    }

    renderSidebar();

    // Mobile
    document.getElementById('dash-hamburger').addEventListener('click', openMobileSidebar);
    document.getElementById('dash-backdrop').addEventListener('click', closeMobileSidebar);

    // Route
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
  }

  return {
    init: init,
    deleteSub: deleteSub,
  };
})();

document.addEventListener('DOMContentLoaded', USC_DASH.init);
