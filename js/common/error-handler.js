/**
 * グローバルエラーハンドラー
 * アプリケーション全体の未処理エラーをキャッチして記録
 */
(function () {
    'use strict';

    /**
     * 未処理エラーのキャッチ
     */
    window.addEventListener('error', function (event) {
        console.error('未処理エラー:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });

        // 本番環境ではここでエラーログサービスに送信
        // 例: Sentry、Firebase Crashlyticsなど
    });

    /**
     * 未処理Promise拒否のキャッチ
     */
    window.addEventListener('unhandledrejection', function (event) {
        console.error('未処理Promise拒否:', {
            reason: event.reason,
            promise: event.promise
        });

        // 本番環境ではここでエラーログサービスに送信
    });

    /**
     * エラー情報を整形してコンソールに出力
     * @param {string} context - エラーが発生したコンテキスト
     * @param {Error} error - エラーオブジェクト
     */
    function logError(context, error) {
        console.error(`[${context}]`, {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
    }

    /**
     * ユーザーにエラーメッセージを表示
     * @param {string} message - 表示するメッセージ
     */
    function showErrorToUser(message) {
        alert(message);
    }

    // グローバルに公開
    window.MyHomeErrorHandler = {
        logError,
        showErrorToUser
    };
})();
