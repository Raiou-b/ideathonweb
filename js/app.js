/**
 * app.js - Main application entry point
 * Detects current page and initialises the appropriate module.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Seed demo data on first visit
  Storage.seedDemoData();

  // Shared: nav
  Utils.setActiveNav();
  Utils.initMobileNav();

  // Page detection
  const path = window.location.pathname.split('/').pop() || 'index.html';

  if (path === 'index.html' || path === '') {
    HomePage.init();
  } else if (path === 'propose.html') {
    ProposePage.init();
  } else if (path === 'realization.html') {
    RealizationPage.init();
  }
});

/* ========================================================
   HOME PAGE
   ======================================================== */
const HomePage = (() => {
  function init() {
    renderStats();
    renderRecentEvents();
  }

  function renderStats() {
    const ideathons = Storage.getIdeathons();
    const ideas     = Storage.getIdeas();
    const active    = ideathons.filter(i => i.status === 'active').length;

    const el = id => document.getElementById(id);
    if (el('stat-ideathons')) el('stat-ideathons').textContent = ideathons.length;
    if (el('stat-ideas'))     el('stat-ideas').textContent     = ideas.length;
    if (el('stat-active'))    el('stat-active').textContent    = active;
  }

  function renderRecentEvents() {
    const container = document.getElementById('recent-events');
    if (!container) return;

    const ideathons = Storage.getIdeathons().slice(0, 6);
    if (ideathons.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>まだアイデアソンがありません</p>
          <a href="propose.html" class="btn btn-primary">最初のアイデアソンを作成</a>
        </div>`;
      return;
    }

    container.innerHTML = ideathons.map(ev => renderEventCard(ev)).join('');
  }

  function renderEventCard(ev) {
    const cat    = Utils.getCategoryMeta(ev.category);
    const status = Utils.getStatusMeta(ev.status);
    const tags   = (ev.tags || []).map(t => `<span class="badge badge-gray">${Utils.escapeHtml(t)}</span>`).join('');

    return `
      <article class="event-card">
        <div class="event-card-header">
          <div class="event-card-meta">
            <span class="badge ${status.badge}">${status.label}</span>
            <span class="badge ${cat.badge}">${cat.emoji} ${cat.label}</span>
          </div>
          <h3>${Utils.escapeHtml(ev.title)}</h3>
        </div>
        <div class="event-card-body">
          <p>${Utils.escapeHtml(ev.description || '')}</p>
        </div>
        <div class="event-card-footer">
          <div class="event-info">
            <span>📅</span> ${Utils.formatDate(ev.date)}
          </div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap">${tags}</div>
          <a href="realization.html?ideathon=${Utils.escapeHtml(ev.id)}" class="btn btn-outline btn-sm">詳細 →</a>
        </div>
      </article>`;
  }

  return { init };
})();

/* ========================================================
   PROPOSE PAGE
   ======================================================== */
const ProposePage = (() => {
  let tags = [];

  function init() {
    const form = document.getElementById('propose-form');
    if (!form) return;

    initTagsInput();
    initPreview();
    initFormValidation(form);

    form.addEventListener('submit', handleSubmit);
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if (confirm('入力内容をリセットしますか？')) {
        form.reset();
        tags = [];
        renderTags();
        clearPreview();
      }
    });
  }

  // ── Tags ──────────────────────────────────────────────
  function initTagsInput() {
    const input = document.getElementById('tags-input');
    if (!input) return;

    input.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
        e.preventDefault();
        addTag(input.value.trim().replace(/,/g, ''));
        input.value = '';
      }
      if (e.key === 'Backspace' && !input.value && tags.length) {
        tags.pop();
        renderTags();
      }
    });
  }

  function addTag(value) {
    const cleaned = value.trim();
    if (!cleaned || tags.includes(cleaned) || tags.length >= 5) return;
    tags.push(cleaned);
    renderTags();
  }

  function renderTags() {
    const wrapper = document.getElementById('tags-wrapper');
    if (!wrapper) return;
    const input = document.getElementById('tags-input');
    // Remove existing chips
    wrapper.querySelectorAll('.tag-chip').forEach(el => el.remove());
    // Insert chips before input
    tags.forEach((t, i) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${Utils.escapeHtml(t)}<button class="tag-remove" data-idx="${i}" type="button" aria-label="タグを削除">×</button>`;
      wrapper.insertBefore(chip, input);
    });
    // Remove listeners and re-bind
    wrapper.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        tags.splice(parseInt(btn.dataset.idx), 1);
        renderTags();
      });
    });
    updatePreview();
  }

  // ── Live preview ──────────────────────────────────────
  function initPreview() {
    ['title', 'description', 'category', 'date', 'participants'].forEach(id => {
      const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
      if (el) el.addEventListener('input', updatePreview);
    });
    document.querySelectorAll('input[name="category"]').forEach(r => r.addEventListener('change', updatePreview));
  }

  function updatePreview() {
    const title   = document.getElementById('title')?.value || '';
    const desc    = document.getElementById('description')?.value || '';
    const date    = document.getElementById('date')?.value || '';
    const cat     = document.querySelector('input[name="category"]:checked')?.value || '';
    const part    = document.getElementById('participants')?.value || '';

    const elTitle  = document.getElementById('preview-title');
    const elDesc   = document.getElementById('preview-desc');
    const elMeta   = document.getElementById('preview-meta');

    if (elTitle) elTitle.textContent = title || 'タイトル未入力';
    if (elDesc)  elDesc.textContent  = desc  || '説明未入力';

    if (elMeta) {
      const catMeta = cat ? Utils.getCategoryMeta(cat) : null;
      const tagHtml = tags.map(t => `<span class="badge badge-gray">${Utils.escapeHtml(t)}</span>`).join('');
      elMeta.innerHTML = [
        date    ? `<span class="badge badge-primary">📅 ${Utils.formatDate(date)}</span>` : '',
        part    ? `<span class="badge badge-accent">👥 ${Utils.escapeHtml(part)}</span>` : '',
        catMeta ? `<span class="badge ${catMeta.badge}">${catMeta.emoji} ${catMeta.label}</span>` : '',
        tagHtml,
      ].join('');
    }
  }

  function clearPreview() {
    tags = [];
    renderTags();
    const elTitle = document.getElementById('preview-title');
    const elDesc  = document.getElementById('preview-desc');
    const elMeta  = document.getElementById('preview-meta');
    if (elTitle) elTitle.textContent = 'タイトル未入力';
    if (elDesc)  elDesc.textContent  = '説明未入力';
    if (elMeta)  elMeta.innerHTML    = '';
  }

  // ── Validation ────────────────────────────────────────
  function initFormValidation(form) {
    form.querySelectorAll('.form-control').forEach(input => {
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateInput(input);
      });
    });
  }

  function validateInput(input) {
    const group = input.closest('.form-group');
    if (!group) return true;
    const errorEl = group.querySelector('.form-error');
    const required = input.hasAttribute('required');
    let error = '';

    if (required && !input.value.trim()) {
      error = '必須項目です';
    } else if (input.id === 'title' && input.value.trim().length > 100) {
      error = '100文字以内で入力してください';
    } else if (input.id === 'description' && input.value.trim().length > 1000) {
      error = '1000文字以内で入力してください';
    }

    input.classList.toggle('error', !!error);
    if (errorEl) {
      errorEl.textContent = error;
      errorEl.classList.toggle('visible', !!error);
    }
    return !error;
  }

  function validateAll(form) {
    let valid = true;
    form.querySelectorAll('.form-control[required]').forEach(input => {
      if (!validateInput(input)) valid = false;
    });
    // Category required
    const catSelected = form.querySelector('input[name="category"]:checked');
    const catGroup = document.getElementById('category-error');
    if (!catSelected) {
      if (catGroup) { catGroup.textContent = 'カテゴリーを選択してください'; catGroup.classList.add('visible'); }
      valid = false;
    } else {
      if (catGroup) { catGroup.textContent = ''; catGroup.classList.remove('visible'); }
    }
    return valid;
  }

  // ── Submit ────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!validateAll(form)) {
      Utils.showToast('入力内容を確認してください', 'error');
      return;
    }

    const ideathon = {
      id:             Utils.uid(),
      title:          form.title.value.trim(),
      date:           form.date.value,
      endDate:        form.endDate?.value || '',
      participants:   form.participants.value.trim(),
      maxParticipants: parseInt(form.maxParticipants?.value) || 0,
      category:       form.querySelector('input[name="category"]:checked')?.value || 'other',
      description:    form.description.value.trim(),
      details:        form.details?.value.trim() || '',
      tags:           [...tags],
      status:         form.status?.value || 'upcoming',
      createdAt:      new Date().toISOString(),
    };

    Storage.saveIdeathon(ideathon);
    Utils.showToast('アイデアソンを作成しました！', 'success');

    form.reset();
    tags = [];
    renderTags();
    clearPreview();

    setTimeout(() => {
      window.location.href = `realization.html?ideathon=${ideathon.id}`;
    }, 1200);
  }

  return { init };
})();

/* ========================================================
   REALIZATION PAGE
   ======================================================== */
const RealizationPage = (() => {
  let selectedIdeathonId = null;
  let filterStatus = 'all';
  let searchQuery   = '';
  let currentIdea   = null;

  function init() {
    renderIdeathonList();

    // Pre-select from URL param
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('ideathon');
    if (pid) {
      selectIdeathon(pid);
    }

    // Search
    const searchInput = document.getElementById('search-ideas');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(e => {
        searchQuery = e.target.value.toLowerCase();
        renderIdeas();
      }));
    }

    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterStatus = chip.dataset.status || 'all';
        renderIdeas();
      });
    });

    // Add idea button
    document.getElementById('btn-add-idea')?.addEventListener('click', openAddIdeaModal);

    // Modal close
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('btn-modal-cancel')?.addEventListener('click', closeModal);
    document.getElementById('modal-form')?.addEventListener('submit', handleModalSubmit);

    // Progress slider live display
    document.getElementById('idea-progress')?.addEventListener('input', e => {
      const display = document.getElementById('progress-display');
      if (display) display.textContent = e.target.value + '%';
    });

    // Detail close
    document.getElementById('detail-close')?.addEventListener('click', closeDetail);
  }

  // ── Ideathon list ─────────────────────────────────────
  function renderIdeathonList() {
    const list = document.getElementById('ideathon-list');
    if (!list) return;

    const ideathons = Storage.getIdeathons();
    if (ideathons.length === 0) {
      list.innerHTML = `<li style="padding:1rem;color:var(--text-muted);font-size:0.85rem;text-align:center">アイデアソンがありません</li>`;
      return;
    }

    list.innerHTML = ideathons.map(ev => {
      const status = Utils.getStatusMeta(ev.status);
      const ideasCount = Storage.getIdeas(ev.id).length;
      return `
        <li class="ideathon-list-item${selectedIdeathonId === ev.id ? ' active' : ''}"
            data-id="${Utils.escapeHtml(ev.id)}">
          <h4>${Utils.escapeHtml(ev.title)}</h4>
          <div class="item-meta">
            <span class="badge ${status.badge}" style="font-size:0.72rem">${status.label}</span>
            <span>💡 ${ideasCount}件</span>
          </div>
        </li>`;
    }).join('');

    list.querySelectorAll('.ideathon-list-item').forEach(item => {
      item.addEventListener('click', () => selectIdeathon(item.dataset.id));
    });
  }

  function selectIdeathon(id) {
    selectedIdeathonId = id;
    // Highlight
    document.querySelectorAll('.ideathon-list-item').forEach(item => {
      item.classList.toggle('active', item.dataset.id === id);
    });
    closeDetail();
    renderIdeas();
    renderIdeathonDetail(id);

    // Enable add button
    const btn = document.getElementById('btn-add-idea');
    if (btn) btn.disabled = false;
  }

  function renderIdeathonDetail(id) {
    const ev = Storage.getIdeathonById(id);
    const el = document.getElementById('ideathon-detail-title');
    if (el && ev) el.textContent = ev.title;
    const sub = document.getElementById('ideathon-detail-sub');
    if (sub && ev) {
      const cat = Utils.getCategoryMeta(ev.category);
      const st  = Utils.getStatusMeta(ev.status);
      sub.innerHTML = `
        <span class="badge ${st.badge}">${st.label}</span>
        <span class="badge ${cat.badge}">${cat.emoji} ${cat.label}</span>
        <span style="font-size:0.85rem;color:var(--text-muted)">📅 ${Utils.formatDate(ev.date)}</span>`;
    }
  }

  // ── Ideas ─────────────────────────────────────────────
  function renderIdeas() {
    const container = document.getElementById('ideas-container');
    if (!container) return;

    if (!selectedIdeathonId) {
      container.innerHTML = `
        <div class="no-selection">
          <div class="icon">👈</div>
          <p>左のリストからアイデアソンを選択してください</p>
        </div>`;
      return;
    }

    let ideas = Storage.getIdeas(selectedIdeathonId);

    // Filter
    if (filterStatus !== 'all') {
      ideas = ideas.filter(i => i.status === filterStatus);
    }
    // Search
    if (searchQuery) {
      ideas = ideas.filter(i =>
        i.title.toLowerCase().includes(searchQuery) ||
        (i.description || '').toLowerCase().includes(searchQuery)
      );
    }

    if (ideas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💡</div>
          <p>${searchQuery || filterStatus !== 'all' ? '条件に合うアイデアがありません' : 'まだアイデアがありません'}</p>
          ${!searchQuery && filterStatus === 'all' ? '<p>「アイデアを追加」ボタンから追加しましょう</p>' : ''}
        </div>`;
      return;
    }

    container.innerHTML = `<div class="ideas-grid">${ideas.map(renderIdeaCard).join('')}</div>`;

    // Bind events
    container.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        toggleVote(btn.dataset.ideaId);
      });
    });
    container.querySelectorAll('.btn-view-idea').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDetail(btn.dataset.ideaId);
      });
    });
    container.querySelectorAll('.idea-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => openDetail(card.dataset.ideaId));
    });
  }

  function renderIdeaCard(idea) {
    const status  = Utils.getStatusMeta(idea.status);
    const voted   = Storage.hasVoted(idea.id);
    const tags    = (idea.tags || []).map(t => `<span class="badge badge-gray">${Utils.escapeHtml(t)}</span>`).join('');
    const prog    = Math.min(100, Math.max(0, idea.progress || 0));

    return `
      <article class="idea-card" data-idea-id="${Utils.escapeHtml(idea.id)}">
        <div class="idea-card-top">
          <div class="idea-card-meta">
            <span class="badge ${status.badge}">${status.label}</span>
            ${tags}
          </div>
          <h3>${Utils.escapeHtml(idea.title)}</h3>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem">by ${Utils.escapeHtml(idea.author || '匿名')}</div>
        </div>
        <p class="idea-card-desc">${Utils.escapeHtml(idea.description || '')}</p>
        <div class="progress-section">
          <div class="progress-label">
            <span>進捗</span><span>${prog}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${prog}%"></div>
          </div>
        </div>
        <div class="idea-card-footer">
          <div class="vote-section">
            <button class="vote-btn${voted ? ' voted' : ''}" data-idea-id="${Utils.escapeHtml(idea.id)}" type="button">
              👍 ${voted ? '投票済み' : '投票'}
            </button>
            <span class="vote-count">${idea.votes || 0}</span>
          </div>
          <div style="display:flex;gap:0.4rem">
            <button class="btn btn-outline btn-sm btn-view-idea" data-idea-id="${Utils.escapeHtml(idea.id)}" type="button">詳細</button>
          </div>
        </div>
      </article>`;
  }

  function toggleVote(ideaId) {
    const idea = Storage.getIdeaById(ideaId);
    if (!idea) return;
    const wasVoted = Storage.hasVoted(ideaId);
    Storage.toggleVote(ideaId);
    idea.votes = Math.max(0, (idea.votes || 0) + (wasVoted ? -1 : 1));
    Storage.saveIdea(idea);
    renderIdeas();
    if (currentIdea?.id === ideaId) openDetail(ideaId);
    Utils.showToast(wasVoted ? '投票を取り消しました' : '投票しました！', 'success', 2000);
  }

  // ── Detail panel ──────────────────────────────────────
  function openDetail(ideaId) {
    const idea = Storage.getIdeaById(ideaId);
    if (!idea) return;
    currentIdea = idea;

    const panel = document.getElementById('detail-panel');
    if (!panel) return;

    const status  = Utils.getStatusMeta(idea.status);
    const tags    = (idea.tags || []).map(t => `<span class="badge badge-gray">${Utils.escapeHtml(t)}</span>`).join('');
    const prog    = Math.min(100, Math.max(0, idea.progress || 0));
    const voted   = Storage.hasVoted(idea.id);

    panel.innerHTML = `
      <div class="detail-header">
        <div>
          <div class="detail-meta">
            <span class="badge ${status.badge}">${status.label}</span>
            ${tags}
          </div>
          <h2>${Utils.escapeHtml(idea.title)}</h2>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.3rem">
            by ${Utils.escapeHtml(idea.author || '匿名')} ・ ${Utils.timeAgo(idea.updatedAt || idea.createdAt)}
          </div>
        </div>
        <button id="detail-close" class="detail-close" type="button" aria-label="閉じる">✕</button>
      </div>

      <div class="detail-section">
        <h4>アイデア概要</h4>
        <p>${Utils.escapeHtml(idea.description || '')}</p>
      </div>

      ${idea.details ? `
      <div class="detail-section">
        <h4>詳細説明</h4>
        <p>${Utils.escapeHtml(idea.details)}</p>
      </div>` : ''}

      <div class="detail-section">
        <h4>進捗状況</h4>
        <div class="progress-label" style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:600;color:var(--text-muted);margin-bottom:0.4rem">
          <span>進捗</span><span>${prog}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${prog}%"></div>
        </div>
      </div>

      <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;padding-top:0.5rem;border-top:1px solid var(--border)">
        <div class="vote-section">
          <button id="detail-vote-btn" class="vote-btn${voted ? ' voted' : ''}" data-idea-id="${Utils.escapeHtml(idea.id)}" type="button">
            👍 ${voted ? '投票済み' : '投票する'}
          </button>
          <span class="vote-count">${idea.votes || 0} 票</span>
        </div>
        <button id="detail-edit-btn" class="btn btn-outline btn-sm" type="button">✏️ 編集</button>
        <button id="detail-delete-btn" class="btn btn-danger btn-sm" type="button">🗑️ 削除</button>
      </div>`;

    panel.classList.add('open');

    document.getElementById('detail-close')?.addEventListener('click', closeDetail);
    document.getElementById('detail-vote-btn')?.addEventListener('click', () => toggleVote(idea.id));
    document.getElementById('detail-edit-btn')?.addEventListener('click', () => openEditIdeaModal(idea.id));
    document.getElementById('detail-delete-btn')?.addEventListener('click', () => confirmDeleteIdea(idea.id));
  }

  function closeDetail() {
    const panel = document.getElementById('detail-panel');
    if (panel) panel.classList.remove('open');
    currentIdea = null;
  }

  // ── Modal ─────────────────────────────────────────────
  function openAddIdeaModal() {
    if (!selectedIdeathonId) return;
    openModal({
      title: 'アイデアを追加',
      idea: null,
    });
  }

  function openEditIdeaModal(ideaId) {
    const idea = Storage.getIdeaById(ideaId);
    if (!idea) return;
    openModal({ title: 'アイデアを編集', idea });
  }

  function openModal({ title, idea }) {
    const overlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('modal-form');
    if (!overlay || !form) return;

    if (modalTitle) modalTitle.textContent = title;

    // Populate or clear form
    form.elements['idea-id'].value          = idea?.id || '';
    form.elements['idea-title'].value        = idea?.title || '';
    form.elements['idea-author'].value       = idea?.author || '';
    form.elements['idea-description'].value  = idea?.description || '';
    form.elements['idea-details'].value      = idea?.details || '';
    form.elements['idea-progress'].value     = idea?.progress ?? 0;
    form.elements['idea-tags'].value         = (idea?.tags || []).join(', ');
    document.getElementById('progress-display').textContent = (idea?.progress ?? 0) + '%';

    // Status radio
    const statusVal = idea?.status || 'planning';
    const radio = form.querySelector(`input[name="idea-status"][value="${statusVal}"]`);
    if (radio) radio.checked = true;

    overlay.classList.add('open');
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const title = form.elements['idea-title'].value.trim();
    if (!title) {
      Utils.showToast('タイトルを入力してください', 'error');
      return;
    }

    const existingId = form.elements['idea-id'].value;
    const existing   = existingId ? Storage.getIdeaById(existingId) : null;
    const tagsRaw    = form.elements['idea-tags'].value;
    const tags       = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const idea = {
      id:           existing?.id || Utils.uid(),
      ideathonId:   selectedIdeathonId,
      title,
      author:       form.elements['idea-author'].value.trim() || '匿名',
      description:  form.elements['idea-description'].value.trim(),
      details:      form.elements['idea-details'].value.trim(),
      progress:     parseInt(form.elements['idea-progress'].value) || 0,
      status:       form.querySelector('input[name="idea-status"]:checked')?.value || 'planning',
      tags,
      votes:        existing?.votes || 0,
      createdAt:    existing?.createdAt || new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
    };

    Storage.saveIdea(idea);
    Utils.showToast(existing ? 'アイデアを更新しました' : 'アイデアを追加しました！', 'success');
    closeModal();
    renderIdeas();
    renderIdeathonList();

    if (existing) openDetail(idea.id);
  }

  function confirmDeleteIdea(ideaId) {
    if (!confirm('このアイデアを削除しますか？この操作は取り消せません。')) return;
    Storage.deleteIdea(ideaId);
    Utils.showToast('アイデアを削除しました', 'success');
    closeDetail();
    renderIdeas();
    renderIdeathonList();
  }

  return { init };
})();
