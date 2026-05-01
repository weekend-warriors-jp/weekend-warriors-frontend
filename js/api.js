// Weekend Warriors — API Client
// When served from the same FastAPI server, use relative path.
// For local file:// development, change to 'http://localhost:8000/api/v1'.
const API_BASE = 'https://weekend-warriors-api.onrender.com/api/v1';

const api = {
  async _get(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },

  async _post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },

  getEvents()          { return this._get('/events'); },
  getEvent(id)         { return this._get(`/events/${encodeURIComponent(id)}`); },
  getPlayers(id)       { return this._get(`/events/${encodeURIComponent(id)}/players`); },
  getLeaderboard(id, mode = 'net') {
    return this._get(`/events/${encodeURIComponent(id)}/leaderboard?mode=${mode}`);
  },

  // user_id は将来のログイン連携用。現時点では省略（null）で動作する
  postPlayer(eventId, name) {
    return this._post(`/events/${encodeURIComponent(eventId)}/players`, { name });
  },
};

// ── Shared helpers ────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

const TYPE_LABEL = { competition: 'コンペ', practice: '練習会', camp: '合宿' };
