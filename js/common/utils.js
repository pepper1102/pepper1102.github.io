/**
 * 共通ユーティリティ関数
 * プロジェクト全体で使用する汎用的な関数を提供
 */
(function () {
    'use strict';

    /**
     * HTMLエスケープ（XSS対策）
     * ユーザー入力をHTMLとして表示する際に使用
     * @param {string} text - エスケープするテキスト
     * @returns {string} エスケープされたテキスト
     */
    function escapeHtml(text) {
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    /**
     * 日本円フォーマット
     * 数値を日本円の表示形式（¥10,000）に変換
     * @param {number} amount - 金額
     * @returns {string} フォーマットされた金額文字列
     */
    function formatYen(amount) {
        return Number(amount).toLocaleString('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        });
    }

    /**
     * 今日の日付を取得（YYYY-MM-DD形式）
     * @returns {string} 今日の日付
     */
    function getTodayDateString() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    /**
     * ユニークIDを生成
     * @param {string} prefix - IDのプレフィックス（デフォルト: 'id'）
     * @returns {string} ユニークID
     */
    function generateId(prefix = 'id') {
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 日付フォーマット（表示用）
     * YYYY-MM-DD形式の文字列を日本語表示に変換
     * @param {string} dateString - 日付文字列（YYYY-MM-DD）
     * @returns {string} フォーマットされた日付（例: 2025年11月30日）
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * 日付フィールドに今日の日付を設定
     * @param {string} elementId - date input要素のID
     */
    function setTodayDate(elementId) {
        const dateInput = document.getElementById(elementId);
        if (dateInput) {
            dateInput.value = getTodayDateString();
        }
    }

    // グローバルに公開
    window.MyHomeUtils = {
        escapeHtml,
        formatYen,
        getTodayDateString,
        generateId,
        formatDate,
        setTodayDate
    };
})();
