const USC = (function () {
  const KEY = 'usc-user';
  let _user = null;

  // Inject nav-user styles
  const style = document.createElement('style');
  style.textContent = '.nav-login{font-size:0.8rem;font-weight:500;color:var(--nav-text);transition:color 0.2s;padding:6px 14px;border:1px solid var(--border);border-radius:100px;text-decoration:none}.nav-login:hover{color:var(--nav-text-hover);border-color:var(--nav-text-hover)}.nav-user{position:relative}.nav-avatar{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--gold);background:var(--gold-dim);color:var(--gold);font-size:0.72rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:"Inter",sans-serif;transition:border-color 0.2s}.nav-avatar:hover{border-color:var(--nav-text-hover)}.user-dropdown{position:absolute;top:calc(100% + 8px);right:0;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;min-width:220px;display:none;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:100}.user-dropdown.open{display:block}.user-dropdown-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}.user-dropdown-avatar{width:36px;height:36px;border-radius:50%;border:1.5px solid var(--gold);background:var(--gold-dim);color:var(--gold);font-size:0.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}.user-dropdown-name{font-size:0.85rem;font-weight:600;color:var(--text)}.user-dropdown-email{font-size:0.72rem;color:var(--text-3)}.user-dropdown hr{border:none;border-top:1px solid var(--border);margin:8px 0}.user-dropdown a{display:block;font-size:0.82rem;color:var(--text-2);padding:6px 0;transition:color 0.2s;text-decoration:none}.user-dropdown a:hover{color:var(--gold)}';
  document.head.appendChild(style);

  // Load cached user from localStorage instantly
  function _loadCache() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // Save user to localStorage
  function _saveCache(user) {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  }

  // ── Public API ──

  function getUser() { return _user || _loadCache(); }
  function isLoggedIn() { return !!getUser(); }
  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  // Check server session on page load — updates cache silently
  async function init() {
    if (typeof USC_API === 'undefined') return; // API not loaded
    try {
      const res = await USC_API.checkSession();
      if (res.user) {
        _user = res.user;
        _saveCache(_user);
      } else {
        _user = null;
        _saveCache(null);
      }
      updateNav(); // refresh nav with server state
    } catch (e) {
      // API offline — keep cached user
    }
  }

  // Sign up — returns promise
  async function signup(name, email, password) {
    const res = await USC_API.signup(name, email, password);
    _user = res.user;
    _saveCache(_user);
    return res;
  }

  // Login — returns promise
  async function login(email, password) {
    const res = await USC_API.login(email, password);
    _user = res.user;
    _saveCache(_user);
    return res;
  }

  // Login from existing data (for backward compatibility with localStorage-only)
  function loginLocal(data) {
    _user = data;
    _saveCache(_user);
  }

  // Logout — calls API then clears local state
  async function logout() {
    try { await USC_API.logout(); } catch (e) { /* ignore */ }
    _user = null;
    localStorage.removeItem(KEY);
    window.location.href = 'index.html';
  }

  // ── Nav Rendering ──

  function updateNav() {
    const container = document.getElementById('nav-r');
    if (!container) return;
    const user = getUser();
    const themeBtn = '<button class="theme-toggle" aria-label="Toggle dark mode"><svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.5" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.5" fill="none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>';
    const hamburger = '<button class="nav-toggle" aria-label="Toggle menu"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.5" fill="none"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>';

    if (user) {
      container.innerHTML = '<div class="nav-user"><button class="nav-avatar" id="nav-avatar-btn">' + getInitials(user.name) + '</button><div class="user-dropdown" id="user-dropdown"><div class="user-dropdown-head"><div class="user-dropdown-avatar">' + getInitials(user.name) + '</div><div><div class="user-dropdown-name">' + user.name + '</div><div class="user-dropdown-email">' + user.email + '</div></div></div><hr><a href="community.html">My Profile</a><a href="#" id="nav-logout">Log out</a></div></div>' + themeBtn + hamburger;
      document.getElementById('nav-avatar-btn').addEventListener('click', function (e) { e.stopPropagation(); document.getElementById('user-dropdown').classList.toggle('open') });
      document.addEventListener('click', function () { var d = document.getElementById('user-dropdown'); if (d) d.classList.remove('open') });
      document.getElementById('nav-logout').addEventListener('click', function (e) { e.preventDefault(); logout() });
    } else {
      container.innerHTML = '<a href="login.html" class="nav-login">Log in</a>' + themeBtn + hamburger;
    }

    // Re-bind theme toggle
    var saved = localStorage.getItem('usc-theme');
    if (saved === 'dark') document.body.classList.add('dark-mode');
    var tBtn = container.querySelector('.theme-toggle');
    if (tBtn) tBtn.addEventListener('click', function () { document.body.classList.toggle('dark-mode'); localStorage.setItem('usc-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light') });

    // Re-bind nav toggle
    var nBtn = container.querySelector('.nav-toggle');
    if (nBtn) nBtn.addEventListener('click', function () { document.querySelector('.nav').classList.toggle('nav-open') });

    // Close mobile nav on outside click
    document.addEventListener('click', function (e) { var n = document.querySelector('.nav'); if (n && !n.contains(e.target) && n.classList.contains('nav-open')) n.classList.remove('nav-open') });
  }

  return { getUser, isLoggedIn, login, loginLocal, signup, logout, getInitials, updateNav, init };
})();
