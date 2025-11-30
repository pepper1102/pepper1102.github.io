/**
 * Firebase設定ファイル
 * 
 * firebase-keys.js から設定値を読み込みます
 * firebase-keys.js の作成方法は firebase-keys.sample.js を参照
 */

// firebase-keys.js から設定値を取得
if (typeof FIREBASE_KEYS === 'undefined') {
    console.error('firebase-keys.js が読み込まれていません。firebase-keys.sample.js をコピーして firebase-keys.js を作成してください。');
    alert('Firebase設定エラー: firebase-keys.js が見つかりません。\n\nfirebase-keys.sample.js をコピーして firebase-keys.js を作成してください。');
}

const firebaseConfig = FIREBASE_KEYS;

// Firebase初期化
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Firebaseの初期化に失敗しました。設定を確認してください。');
}

// Firebaseサービスの参照をグローバルに公開
window.firebaseAuth = firebase.auth();
window.firebaseDatabase = firebase.database();

/**
 * セキュリティ注意事項：
 * - APIキーは公開されても問題ありません（Firebaseの設計思想）
 * - セキュリティは Firebase Security Rules で制御されます
 * - 本番環境では firebase-keys.js を .gitignore に追加してください
 */
