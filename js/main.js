// index.html — イベント一覧
(async () => {
  const grid    = document.getElementById('events-grid');
  const loading = document.getElementById('loading');
  const error   = document.getElementById('error');

  try {
    const events = await api.getEvents();
    loading.classList.add('hidden');

    if (!events.length) {
      grid.innerHTML = '<p class="empty-box">イベントはまだありません</p>';
      return;
    }

    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    grid.innerHTML = events.map(renderCard).join('');
  } catch (e) {
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    error.textContent = 'イベントの取得に失敗しました: ' + e.message;
  }
})();

function renderCard(ev) {
  return `
    <div class="card" onclick="location.href='event.html?id=${encodeURIComponent(ev.id)}'">
      <div class="card-badges">
        <span class="badge badge-${ev.type}">${TYPE_LABEL[ev.type] ?? ev.type}</span>
        <span class="badge badge-${ev.status}">${ev.status === 'open' ? '受付中' : '終了'}</span>
      </div>
      <h2 class="card-title">${escapeHtml(ev.name)}</h2>
      <div class="card-meta">
        <div class="meta-row">
          <span>📅</span>
          <span>${formatDate(ev.date)}</span>
        </div>
        <div class="meta-row">
          <span>⛳</span>
          <span>${escapeHtml(ev.course)}</span>
        </div>
      </div>
      <span class="card-arrow">›</span>
    </div>
  `;
}
