# Firebase セキュリティルール設定ガイド

## 概要

MyHomeManagerをFirebaseで安全に動作させるために、Firebaseコンソールでセキュリティルールを設定する必要があります。

---

## 設定手順

### ステップ1: Firebaseコンソールにアクセス

1. https://console.firebase.google.com/ を開く
2. プロジェクト「**myhomemanager-b9f41**」を選択

### ステップ2: Realtime Databaseのセキュリティルール設定

1. 左サイドバーから「**Realtime Database**」をクリック
2. 「**ルール**」タブを選択
3. 以下のルールをコピー&ペースト：

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "families": {
      "$familyId": {
        ".read": "root.child('families').child($familyId).child('members').child(auth.uid).exists()",
        ".write": "root.child('families').child($familyId).child('members').child(auth.uid).exists()"
      }
    },
    "cashbook": {
      "$familyId": {
        ".read": "root.child('families').child($familyId).child('members').child(auth.uid).exists()",
        ".write": "root.child('families').child($familyId).child('members').child(auth.uid).exists()"
      }
    },
    "calendar": {
      "$familyId": {
        ".read": "root.child('families').child($familyId).child('members').child(auth.uid).exists()",
        ".write": "root.child('families').child($familyId).child('members').child(auth.uid).exists()"
      }
    },
    "tasks": {
      "$familyId": {
        ".read": "root.child('families').child($familyId).child('members').child(auth.uid).exists()",
        ".write": "root.child('families').child($familyId).child('members').child(auth.uid).exists()"
      }
    }
  }
}
```

4. 「**公開**」ボタンをクリック

---

## セキュリティルールの説明

### ルールの意味

| パス | 読み取り | 書き込み | 説明 |
|------|---------|---------|------|
| `/users/{uid}` | 本人のみ | 本人のみ | ユーザー情報は本人のみアクセス可能 |
| `/families/{familyId}` | Familyメンバー | Familyメンバー | Familyメンバーのみアクセス可能 |
| `/cashbook/{familyId}` | Familyメンバー | Familyメンバー | 出納帳データはFamilyメンバーのみ |
| `/calendar/{familyId}` | Familyメンバー | Familyメンバー | カレンダーデータはFamilyメンバーのみ |
| `/tasks/{familyId}` | Familyメンバー | Familyメンバー | タスクデータはFamilyメンバーのみ |

### セキュリティポリシー

✅ **許可される操作:**
- ログインしたユーザーが自分のFamily内のデータを読み書き
- ログインしたユーザーが自分のユーザー情報を読み書き

❌ **拒否される操作:**
- 未ログインユーザーのすべての操作
- 他のFamilyのデータへのアクセス
- 他のユーザーの情報へのアクセス

---

## テスト用ルール（開発中のみ）

開発中は、一時的に以下のテストモードルールを使用できます：

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

⚠️ **警告**: このルールは本番環境では使用しないでください！
すべてのログインユーザーがすべてのデータにアクセスできます。

---

## トラブルシューティング

### エラー: "Permission denied"

**原因**: セキュリティルールが正しく設定されていない

**解決方法**:
1. Firebaseコンソールで「ルール」タブを確認
2. 上記の本番ルールが正しく設定されているか確認
3. 「公開」ボタンを押したか確認

### エラー: "Database not initialized"

**原因**: Realtime Databaseが有効化されていない

**解決方法**:
1. Firebaseコンソールで「Realtime Database」を選択
2. 「データベースを作成」をクリック
3. ロケーションを選択（asia-northeast1推奨）
4. テストモードで開始し、後で本番ルールに変更

---

## 確認方法

1. ブラウザで `index.html` を開く
2. 「Googleでログイン」をクリック
3. コンソール（F12）でエラーがないか確認
4. 出納帳ページでデータを追加
5. 別のブラウザでログインして同じデータが見えることを確認

---

**作成日**: 2025-12-01  
**対象バージョン**: 2.0.0（Firebase対応版）
