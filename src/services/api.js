const BASE_URL = '';

function getAuthHeaders() {
  try {
    const saved = localStorage.getItem('raptor360_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user?.email) {
        return { 'X-User-Email': user.email };
      }
    }
  } catch (e) {
    // ignore
  }
  return { 'X-User-Email': 'cogniwide@aischennai.org' };
}

export async function loginUser(email) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed. Please check your email.');
  }
  return res.json();
}

export async function fetchAvailableUsers() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/users`);
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export async function checkAuthSession() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { authenticated: false };
    return res.json();
  } catch (e) {
    return { authenticated: false };
  }
}

export async function fetchDatasets() {
  const res = await fetch(`${BASE_URL}/api/datasets`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch datasets');
  return res.json();
}

export async function fetchDatasetDetail(id) {
  const res = await fetch(`${BASE_URL}/api/datasets/${encodeURIComponent(id)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch dataset ${id}`);
  return res.json();
}

export async function saveDraft(id, sql, author = 'Cogniwide data team') {
  const res = await fetch(`${BASE_URL}/api/datasets/${encodeURIComponent(id)}/save-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ sql, author }),
  });
  if (!res.ok) throw new Error('Failed to save draft');
  return res.json();
}

export async function discardDraft(id) {
  const res = await fetch(`${BASE_URL}/api/datasets/${encodeURIComponent(id)}/discard-draft`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to discard draft');
  return res.json();
}

export async function testRunQuery(id, sql, requiredColumns = null) {
  const res = await fetch(`${BASE_URL}/api/datasets/${encodeURIComponent(id)}/test-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ sql, required_columns: requiredColumns }),
  });
  if (!res.ok) throw new Error('Dry run failed');
  return res.json();
}

export async function publishQuery(id, sql, author = 'Cogniwide data team', summary = 'Updated query via Query Manager') {
  const res = await fetch(`${BASE_URL}/api/datasets/${encodeURIComponent(id)}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ sql, author, summary }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to publish query');
  }
  return res.json();
}

export async function rollbackVersion(id, targetVersion, author = 'Cogniwide data team') {
  const res = await fetch(`${BASE_URL}/api/datasets/${encodeURIComponent(id)}/rollback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ target_version: targetVersion, author }),
  });
  if (!res.ok) throw new Error('Rollback failed');
  return res.json();
}

export async function fetchFilterOptions() {
  const res = await fetch(`${BASE_URL}/api/filters`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load filter options');
  return res.json();
}

export async function fetchWidaDashboardData(filterParams = {}) {
  const res = await fetch(`${BASE_URL}/api/dashboard/wida`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(filterParams),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch WIDA dashboard data');
  }
  return res.json();
}
