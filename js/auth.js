/**
 * 認証モジュール
 * Firebase Authenticationを使用したユーザー認証とFamily管理
 */
(function () {
    'use strict';

    const auth = window.firebaseAuth;
    const db = window.firebaseDatabase;

    let currentUser = null;
    let currentFamilyId = null;

    /**
     * Googleアカウントでログイン
     */
    function loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(provider)
            .then((result) => {
                console.log('ログイン成功:', result.user.displayName);
            })
            .catch((error) => {
                console.error('ログインエラー:', error);

                // エラーメッセージの表示
                let errorMessage = 'ログインに失敗しました';
                switch (error.code) {
                    case 'auth/popup-closed-by-user':
                        errorMessage = 'ログインがキャンセルされました';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'ネットワークエラー。インターネット接続を確認してください';
                        break;
                    case 'auth/popup-blocked':
                        errorMessage = 'ポップアップがブロックされました。ブラウザの設定を確認してください';
                        break;
                    default:
                        errorMessage += ': ' + error.message;
                }

                alert(errorMessage);
            });
    }

    /**
     * ログアウト
     */
    function logout() {
        auth.signOut()
            .then(() => {
                console.log('ログアウト成功');
                currentUser = null;
                currentFamilyId = null;

                // ページリロード
                window.location.reload();
            })
            .catch((error) => {
                console.error('ログアウトエラー:', error);
                alert('ログアウトに失敗しました');
            });
    }

    /**
     * 現在のユーザーを取得
     * @returns {Object|null} ユーザーオブジェクトまたはnull
     */
    function getCurrentUser() {
        return currentUser;
    }

    /**
     * 現在のFamily IDを取得
     * @returns {string|null} Family IDまたはnull
     */
    function getCurrentFamilyId() {
        return currentFamilyId;
    }

    /**
     * Family情報を取得または新規作成
     * @param {string} userId - ユーザーID
     * @returns {Promise<string>} Family ID
     */
    async function getOrCreateFamily(userId) {
        try {
            // ユーザー情報からFamily IDを取得
            const userSnapshot = await db.ref(`users/${userId}`).once('value');
            const userData = userSnapshot.val();

            if (userData && userData.familyId) {
                // 既存のFamily IDを返す
                return userData.familyId;
            }

            // 新規Family作成
            const familyId = 'family_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const familyData = {
                name: currentUser.displayName + 'の家族',
                createdBy: userId,
                createdAt: Date.now(),
                members: {
                    [userId]: true
                }
            };

            // Familyデータを保存
            await db.ref(`families/${familyId}`).set(familyData);

            // ユーザー情報を保存
            await db.ref(`users/${userId}`).set({
                email: currentUser.email,
                displayName: currentUser.displayName,
                familyId: familyId,
                createdAt: Date.now()
            });

            console.log('新規Family作成:', familyId);
            return familyId;

        } catch (error) {
            console.error('Family取得/作成エラー:', error);
            throw error;
        }
    }

    /**
     * ログインUIを表示
     */
    function showLoginUI() {
        // ログインボタンを表示
        const loginBtn = document.getElementById('login-btn');
        const userInfo = document.getElementById('user-info');

        if (loginBtn) {
            loginBtn.style.display = 'inline-block';
            loginBtn.onclick = loginWithGoogle;
        }

        if (userInfo) {
            userInfo.style.display = 'none';
        }

        // メインコンテンツを非表示（オプション）
        const main = document.querySelector('main');
        if (main) {
            main.style.opacity = '0.3';
            main.style.pointerEvents = 'none';
        }
    }

    /**
     * ログイン後のUIを表示
     */
    function showLoggedInUI(user) {
        const loginBtn = document.getElementById('login-btn');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) {
            loginBtn.style.display = 'none';
        }

        if (userInfo) {
            userInfo.style.display = 'flex';
        }

        if (userName) {
            userName.textContent = user.displayName || user.email;
        }

        if (logoutBtn) {
            logoutBtn.onclick = logout;
        }

        // メインコンテンツを表示
        const main = document.querySelector('main');
        if (main) {
            main.style.opacity = '1';
            main.style.pointerEvents = 'auto';
        }
    }

    /**
     * 認証状態の監視
     */
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // ログイン済み
            currentUser = user;
            console.log('ユーザーログイン:', user.displayName);

            try {
                // Family情報を取得/作成
                currentFamilyId = await getOrCreateFamily(user.uid);
                console.log('Family ID:', currentFamilyId);

                // UIを更新
                showLoggedInUI(user);

                // ページ固有の初期化処理を呼び出し
                if (window.onUserLoggedIn) {
                    window.onUserLoggedIn(user, currentFamilyId);
                }

            } catch (error) {
                console.error('初期化エラー:', error);
                alert('初期化中にエラーが発生しました。ページをリロードしてください。');
            }

        } else {
            // 未ログイン
            console.log('未ログイン状態');
            showLoginUI();
        }
    });

    // グローバルに公開
    window.MyHomeAuth = {
        loginWithGoogle,
        logout,
        getCurrentUser,
        getCurrentFamilyId
    };

})();
