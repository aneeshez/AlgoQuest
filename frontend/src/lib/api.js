async function request(path, options = {}) {
  const response = await fetch(path, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'Something went wrong. Please try again.')
  return data
}

export const api = {
  me: () => request('/api/auth/me/'),
  csrf: () => request('/api/auth/csrf/'),
  modules: () => request('/api/modules/'),
  leaderboard: () => request('/api/leaderboard/'),
  async reportNickname(reportToken, category, details) {
    await request('/api/auth/csrf/')
    const csrf = document.cookie.split('; ').find((entry) => entry.startsWith('csrftoken='))?.split('=').slice(1).join('=')
    return request('/api/leaderboard/report/', { method: 'POST', headers: { 'X-CSRFToken': decodeURIComponent(csrf || '') }, body: JSON.stringify({ reportToken, category, details }) })
  },
  async awardCodeTask(task) {
    await request('/api/auth/csrf/')
    const csrf = document.cookie.split('; ').find((entry) => entry.startsWith('csrftoken='))?.split('=').slice(1).join('=')
    return request('/api/points/code-task/', { method: 'POST', headers: { 'X-CSRFToken': decodeURIComponent(csrf || '') }, body: JSON.stringify({ task }) })
  },
  questProgress: () => request('/api/quests/network-rescue/'),
  async questStep(step, answer) {
    await request('/api/auth/csrf/')
    const csrf = document.cookie.split('; ').find((entry) => entry.startsWith('csrftoken='))?.split('=').slice(1).join('=')
    return request('/api/quests/network-rescue/step/', { method: 'POST', headers: { 'X-CSRFToken': decodeURIComponent(csrf || '') }, body: JSON.stringify({ step, answer }) })
  },
  async updateProfile(payload) {
    await request('/api/auth/csrf/')
    const csrf = document.cookie.split('; ').find((entry) => entry.startsWith('csrftoken='))?.split('=').slice(1).join('=')
    return request('/api/profile/', { method: 'PATCH', headers: { 'X-CSRFToken': decodeURIComponent(csrf || '') }, body: JSON.stringify(payload) })
  },
  lesson: (slug) => request(`/api/lessons/${slug}/`),
  async progress(id, payload) {
    await request('/api/auth/csrf/')
    const csrf = document.cookie.split('; ').find((entry) => entry.startsWith('csrftoken='))?.split('=').slice(1).join('=')
    return request(`/api/progress/lessons/${id}/`, { method: 'POST', headers: { 'X-CSRFToken': decodeURIComponent(csrf || '') }, body: JSON.stringify(payload) })
  },
  async auth(action, payload = {}) {
    await request('/api/auth/csrf/')
    const csrf = document.cookie.split('; ').find((entry) => entry.startsWith('csrftoken='))?.split('=').slice(1).join('=')
    return request(`/api/auth/${action}/`, { method: 'POST', headers: { 'X-CSRFToken': decodeURIComponent(csrf || '') }, body: JSON.stringify(payload) })
  },
}
