// event.html — イベント詳細 + 参加登録
let currentEventId = null;
let currentPlayers  = [];
let currentEvent    = null;

(async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = 'index.html'; return; }
  currentEventId = id;

  const loading   = document.getElementById('loading');
  const error     = document.getElementById('error');
  const container = document.getElementById('container');

  try {
    const [ev, players] = await Promise.all([
      api.getEvent(id),
      api.getPlayers(id).catch(() => []),
    ]);

    currentEvent   = ev;
    currentPlayers = players;

    loading.classList.add('hidden');
    document.title = `${ev.name} — Weekend Warriors`;
    renderHeader(ev);
    renderPlayers();
    container.classList.remove('hidden');
  } catch (e) {
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    error.textContent = 'イベント情報の取得に失敗しました: ' + e.message;
  }
})();

// ── Header ────────────────────────────────────────────

function renderHeader(ev) {
  const el = document.getElementById('event-header');

  const competitionRows = ev.type === 'competition' ? `
    <div class="meta-row">
      <span>🔒</span>
      <span>隠しホール: ${ev.hidden_holes ? ev.hidden_holes.join(', ') + ' 番' : '未設定'}</span>
    </div>
    <div class="meta-row">
      <span>✕</span>
      <span>新ペリア係数: ${ev.multiplier}</span>
    </div>
  ` : '';

  const lbBtn = ev.type === 'competition' ? `
    <a href="leaderboard.html?id=${encodeURIComponent(ev.id)}" class="btn btn-primary mt">
      🏆 リーダーボード
    </a>
  ` : '';

  el.innerHTML = `
    <div class="panel">
      <div class="flex flex-wrap gap-sm">
        <span class="badge badge-${ev.type}">${TYPE_LABEL[ev.type] ?? ev.type}</span>
        <span class="badge badge-${ev.status}">${ev.status === 'open' ? '受付中' : '終了'}</span>
      </div>
      <h1 class="event-title-large">${escapeHtml(ev.name)}</h1>
      <div class="info-grid">
        <div class="meta-row"><span>📅</span><span>${formatDate(ev.date)}</span></div>
        <div class="meta-row"><span>⛳</span><span>${escapeHtml(ev.course)}</span></div>
        ${competitionRows}
      </div>
      ${lbBtn}
    </div>
  `;
}

// ── Players ────────────────────────────────────────────

function renderPlayers() {
  const el = document.getElementById('players-panel');

  const rows = currentPlayers.length
    ? currentPlayers.map(playerRow).join('')
    : '<p class="empty-box">まだ参加者はいません</p>';

  // 受付中のときだけ登録フォームを表示
  const form = currentEvent?.status === 'open' ? `
    <form class="register-form" onsubmit="handleRegister(event)">
      <input
        id="reg-name"
        class="input"
        type="text"
        placeholder="お名前を入力"
        autocomplete="name"
        required
      >
      <button type="submit" class="btn btn-primary btn-sm">参加登録</button>
    </form>
    <p id="reg-msg" class="reg-msg"></p>
  ` : '';

  el.innerHTML = `
    <div class="panel">
      <p class="section-label" id="players-label">参加者 (${currentPlayers.length}名)</p>
      <div id="players-list" class="players-list">${rows}</div>
      ${form}
    </div>
  `;
}

function playerRow(p) {
  return `
    <div class="player-row">
      <div class="player-avatar">${escapeHtml(p.name.charAt(0).toUpperCase())}</div>
      <span>${escapeHtml(p.name)}</span>
    </div>
  `;
}

// ── Registration ───────────────────────────────────────

async function handleRegister(e) {
  e.preventDefault();

  const nameInput = document.getElementById('reg-name');
  const msg       = document.getElementById('reg-msg');
  const btn       = e.target.querySelector('button[type="submit"]');
  const name      = nameInput.value.trim();

  btn.disabled    = true;
  msg.className   = 'reg-msg';
  msg.textContent = '';

  try {
    const player = await api.postPlayer(currentEventId, name);
    currentPlayers.push(player);

    // リストと件数を差分更新（全再レンダリング不要）
    document.getElementById('players-list').innerHTML = currentPlayers.map(playerRow).join('');
    document.getElementById('players-label').textContent = `参加者 (${currentPlayers.length}名)`;

    nameInput.value = '';
    msg.classList.add('reg-msg--ok');
    msg.textContent = `✓ ${player.name} さんの参加登録が完了しました`;
    setTimeout(() => { msg.textContent = ''; msg.className = 'reg-msg'; }, 3000);
  } catch (err) {
    msg.classList.add('reg-msg--err');
    msg.textContent = '登録に失敗しました: ' + err.message;
  } finally {
    btn.disabled = false;
  }
}
