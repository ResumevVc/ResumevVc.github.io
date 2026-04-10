const baseUrl = import.meta.env.VITE_BACKEND_API || '/api';

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

function handleUnauth(res) {
  if (res.status === 401) {
    console.error('API Unauthorized: Token might be expired or missing.');
  }
}

export async function getRepos(token) {
  const res = await fetch(`${baseUrl}/repos`, {
    headers: getHeaders(token)
  });
  handleUnauth(res);
  if (!res.ok) throw new Error('Failed to fetch repos');
  return res.json();
}

export async function createRepo(repoName, baseRepoId = null, token) {
  const res = await fetch(`${baseUrl}/repos`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ repoName, baseRepoId })
  });
  handleUnauth(res);
  if (!res.ok) throw new Error('Failed to create repo');
  return res.json();
}

export async function deleteRepo(repoId, token) {
  const res = await fetch(`${baseUrl}/repos/${repoId}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  handleUnauth(res);
  if (!res.ok) throw new Error('Failed to delete repo');
  return res.json();
}

export async function mergeRepo(repoId, token) {
  const res = await fetch(`${baseUrl}/repos/${repoId}/merge`, {
    method: 'POST',
    headers: getHeaders(token)
  });
  handleUnauth(res);
  if (!res.ok) throw new Error('Failed to merge repo');
  return res.json();
}

export async function getCommits(repoId, token) {
  const res = await fetch(`${baseUrl}/repos/${repoId}/commits`, {
    headers: getHeaders(token)
  });
  handleUnauth(res);
  if (!res.ok) throw new Error('Failed to fetch commits');
  return res.json();
}

export async function createCommit(repoId, commitMessage, resumeData, token) {
  const res = await fetch(`${baseUrl}/repos/${repoId}/commits`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ commitMessage, resumeData })
  });
  handleUnauth(res);
  if (!res.ok) throw new Error('Failed to create commit');
  return res.json();
}

export async function updateRepoNotes(repoId, notes, token) {
  const res = await fetch(`${baseUrl}/repos/${repoId}/notes`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify({ notes })
  });
  handleUnauth(res);
  if (!res.ok) throw new Error('Failed to update notes');
  return res.json();
}

export async function parseResume(formData, token) {
  const res = await fetch(`${baseUrl}/parser/parse`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData
  });
  handleUnauth(res);
  return res;
}
