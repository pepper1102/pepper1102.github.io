/**
 * LocalStorage操作のラッパー
 * エラーハンドリングとデータ検証を提供
 */
(function () {
    'use strict';

    /**
     * LocalStorageからデータを読み込む
     * @param {string} key - ストレージキー
     * @param {*} defaultValue - デフォルト値（データが存在しない場合に返される）
     * @returns {*} 読み込んだデータ
     */
    function load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) {
                return defaultValue;
            }
            return JSON.parse(data);
        } catch (error) {
            console.error(`LocalStorage読み込みエラー (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * LocalStorageにデータを保存
     * @param {string} key - ストレージキー
     * @param {*} value - 保存するデータ
     * @returns {boolean} 成功したかどうか
     */
    function save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`LocalStorage保存エラー (${key}):`, error);

            // 容量不足の場合は特別なメッセージを表示
            if (error.name === 'QuotaExceededError') {
                alert('ストレージの容量が不足しています。不要なデータを削除してください。');
            }

            return false;
        }
    }

    /**
     * LocalStorageからデータを削除
     * @param {string} key - ストレージキー
     * @returns {boolean} 成功したかどうか
     */
    function remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`LocalStorage削除エラー (${key}):`, error);
            return false;
        }
    }

    /**
     * LocalStorageをクリア（全削除）
     * @returns {boolean} 成功したかどうか
     */
    function clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('LocalStorageクリアエラー:', error);
            return false;
        }
    }

    /**
     * 指定したキーのデータが存在するか確認
     * @param {string} key - ストレージキー
     * @returns {boolean} データが存在するか
     */
    function exists(key) {
        return localStorage.getItem(key) !== null;
    }

    // グローバルに公開
    window.MyHomeStorage = {
        load,
        save,
        remove,
        clear,
        exists
    };
})();
