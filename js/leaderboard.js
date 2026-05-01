// leaderboard.html — リーダーボード（net / gross 切替対応）
const eventId = new URLSearchParams(location.search).get('id');
let currentMode = 'net';

(async () => {
  if (!eventId) { location.href = 'index.html'; return; }

  document.getElementById('back-btn').href = `event.html?id=${encodeURIComponent(eventId)}`;

  const loading   = document.getElementById('loading');
  const error     = document.getElementById('error');
  const container = document.getElementById('container');

  try {
    const [ev, entries] = await Promise.all([
      api.getEvent(eventId),
      api.getLeaderboard(eventId, currentMode),
    ]);

    loading.classList.add('hidden');
    document.title = `${ev.name} リーダーボード — Weekend Warriors`;
    document.getElementById('event-name').textContent = ev.name;

    renderTable(entries);
    setUpdated();
    container.classList.remove('hidden');
  } catch (e) {
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    error.textContent = 'リーダーボードの取得に失敗しました: ' + e.message;
  }
})();

// ── Mode switch ────────────────────────────────────────

async function switchMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  // タブの active 更新
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // ソートキーのヘッダーを強調
  document.getElementById('th-net').classList.toggle('th-active', mode === 'net');
  document.getElementById('th-gross').classList.toggle('th-active', mode === 'gross');

  await loadTable();
}

// ── Load / render ──────────────────────────────────────

async function loadTable() {
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  try {
    const entries = await api.getLeaderboard(eventId, currentMode);
    renderTable(entries);
    setUpdated();
  } catch (e) {
    alert('更新に失敗しました: ' + e.message);
  } finally {
    btn.disabled = false;
  }
}

function renderTable(entries) {
  const body = document.getElementById('lb-body');

  if (!entries.length) {
    body.innerHTML = `
      <tr>
        <td colspan="5"><p class="empty-box">スコアはまだ登録されていません</p></td>
      </tr>`;
    return;
  }

  // 単独1〜3位のみメダル絵文字を付与。同順位（T1等）はラベルのみ
  const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const rankDisplay = e =>
    (e.rank <= 3 && !e.rank_label.startsWith('T'))
      ? MEDALS[e.rank]
      : e.rank_label;

  body.innerHTML = entries.map(e => `
    <tr class="${e.rank <= 3 ? `row-${e.rank}` : ''}">
      <td>
        <span class="rank ${e.rank <= 3 ? `rank-${e.rank}` : ''}">${rankDisplay(e)}</span>
      </td>
      <td>${escapeHtml(e.player_name)}</td>
      <td class="${currentMode === 'gross' ? 'col-active' : ''}">${e.gross}</td>
      <td>${e.handicap}</td>
      <td class="${currentMode === 'net' ? 'col-active' : ''}">
        <span class="net-score">${e.net}</span>
      </td>
    </tr>
  `).join('');
}

async function refresh() {
  await loadTable();
}

function setUpdated() {
  document.getElementById('updated-at').textContent =
    '更新: ' + new Date().toLocaleTimeString('ja-JP');
}
