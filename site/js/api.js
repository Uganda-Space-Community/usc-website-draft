/* USC API Client — js/api.js */
const USC_API = (function () {
  const BASE = 'api';

  async function request(endpoint, options = {}) {
    const url = BASE + '/' + endpoint;
    const config = {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    try {
      const res = await fetch(url, config);
      const data = await res.json();
      if (!res.ok) throw { status: res.status, ...data };
      return data;
    } catch (e) {
      if (e.status) throw e;
      // Network error — API server likely offline
      throw { error: 'Network error. Please try again.', offline: true };
    }
  }

  // ── Auth ──
  function signup(name, email, password) {
    return request('auth.php?action=signup', {
      method: 'POST',
      body: { name, email, password },
    });
  }

  function login(email, password) {
    return request('auth.php?action=login', {
      method: 'POST',
      body: { email, password },
    });
  }

  function logout() {
    return request('auth.php?action=logout', { method: 'POST' });
  }

  function checkSession() {
    return request('auth.php?action=check');
  }

  // ── Submissions ──
  function submit(type, payload) {
    return request('submissions.php?action=submit', {
      method: 'POST',
      body: { type, payload },
    });
  }

  function submitQuestion(name, text) {
    return request('submissions.php?action=question', {
      method: 'POST',
      body: { name, text },
    });
  }

  function vote(answerKey, value) {
    return request('submissions.php?action=vote', {
      method: 'POST',
      body: { answer_key: answerKey, value },
    });
  }

  function mySubmissions() {
    return request('submissions.php?action=mine');
  }

  // ── Content (read-only) ──
  function getContent(action) {
    return request('content.php?action=' + action);
  }

  return {
    request,
    signup,
    login,
    logout,
    checkSession,
    submit,
    submitQuestion,
    vote,
    mySubmissions,
    getContent,
  };
})();
