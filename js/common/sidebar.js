/**
 * サイドバー制御モジュール
 * 全ページで共通のサイドバー開閉機能を提供
 */
(function () {
  'use strict';
  
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close');
  const overlay = document.getElementById('overlay');

  if (!sidebar || !toggleBtn) return;

  /**
   * サイドバーを開く
   */
  function openSidebar() {
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    
    if (overlay) {
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('visible'));
    }
    
    const firstLink = sidebar.querySelector('nav a');
    if (firstLink) firstLink.focus();
  }

  /**
   * サイドバーを閉じる
   */
  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.hidden = true, 250);
    }
    
    toggleBtn.focus();
  }

  // イベントリスナー設定
  toggleBtn.addEventListener('click', function () {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Escapeキーでサイドバーを閉じる
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });
})();
