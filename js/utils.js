/**
 * utils.js - Utility functions
 */
const Utils = (() => {
  // Generate a unique ID
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // Format a date string to Japanese locale
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Format ISO timestamp to relative time
  function timeAgo(isoStr) {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return 'たった今';
    if (mins  < 60) return `${mins}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  }

  // Category meta
  const CATEGORIES = {
    technology:  { label: 'テクノロジー', emoji: '💻', badge: 'badge-primary' },
    environment: { label: '環境・サステナブル', emoji: '🌱', badge: 'badge-success' },
    community:   { label: 'コミュニティ', emoji: '🏘️', badge: 'badge-accent' },
    education:   { label: '教育', emoji: '📚', badge: 'badge-warning' },
    health:      { label: 'ヘルスケア', emoji: '🏥', badge: 'badge-danger' },
    business:    { label: 'ビジネス', emoji: '💼', badge: 'badge-gray' },
    art:         { label: 'アート・文化', emoji: '🎨', badge: 'badge-accent' },
    other:       { label: 'その他', emoji: '💡', badge: 'badge-gray' },
  };

  function getCategoryMeta(key) {
    return CATEGORIES[key] || CATEGORIES.other;
  }

  // Status meta
  const STATUSES = {
    upcoming:    { label: '開催予定', badge: 'badge-primary' },
    active:      { label: '開催中',   badge: 'badge-success' },
    completed:   { label: '終了',     badge: 'badge-gray' },
    cancelled:   { label: 'キャンセル', badge: 'badge-danger' },
    // idea statuses
    planning:    { label: '計画中',   badge: 'badge-warning' },
    development: { label: '開発中',   badge: 'badge-primary' },
    prototype:   { label: 'プロト',   badge: 'badge-accent' },
  };

  function getStatusMeta(key) {
    return STATUSES[key] || { label: key, badge: 'badge-gray' };
  }

  // Escape HTML
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Show a toast notification
  function showToast(message, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${escapeHtml(message)}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Validate a form field – returns error message or empty string
  function validateField(value, rules) {
    if (rules.required && !value.trim()) return '必須項目です';
    if (rules.minLength && value.trim().length < rules.minLength)
      return `${rules.minLength}文字以上入力してください`;
    if (rules.maxLength && value.trim().length > rules.maxLength)
      return `${rules.maxLength}文字以内で入力してください`;
    if (rules.pattern && !rules.pattern.test(value))
      return rules.patternMsg || '形式が正しくありません';
    return '';
  }

  // Set active nav link based on current page
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
    });
  }

  // Mobile nav toggle
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // Debounce
  function debounce(fn, delay = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  return {
    uid,
    formatDate,
    timeAgo,
    getCategoryMeta,
    getStatusMeta,
    escapeHtml,
    showToast,
    validateField,
    setActiveNav,
    initMobileNav,
    debounce,
    CATEGORIES,
    STATUSES,
  };
})();
