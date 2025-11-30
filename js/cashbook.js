// Cashbook page logic: Firebase Realtime Database-based entries
(function () {
  const STORAGE_KEY = 'cashbookEntries';
  const MIGRATION_KEY = 'migrated_to_firebase';
  const form = document.getElementById('entry-form');
  const tableBody = document.querySelector('#entries-table tbody');

  let entries = [];
  let editingIndex = null;
  let entriesRef = null; // Firebase参照
  let currentFamilyId = null; // 現在のFamily ID

  // ===== ユーティリティ関数 =====

  function formatYen(n) {
    return Number(n).toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  }

  // 今日の日付を取得する関数
  function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // 日付フィールドに今日の日付を設定する関数
  function setTodayDate() {
    const dateInput = document.getElementById('entry-date');
    if (dateInput) {
      dateInput.value = getTodayDateString();
    }
  }

  // ユニークIDを生成
  function generateId() {
    return 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // データマイグレーション: 既存データにIDを付与
  function migrateData() {
    let needsMigration = false;

    entries = entries.map(entry => {
      // IDがない場合は追加
      if (!entry.id) {
        needsMigration = true;
        entry.id = generateId();
        entry.relatedTo = null;
        entry.hasReturn = false;
      }
      // relatedToがない場合は追加（後方互換性）
      if (entry.relatedTo === undefined) {
        entry.relatedTo = null;
      }
      // hasReturnがない場合は追加
      if (entry.hasReturn === undefined) {
        entry.hasReturn = false;
      }
      return entry;
    });

    if (needsMigration) {
      save();
      console.log('データマイグレーション完了: IDと関連フィールドを付与しました');
    }
  }

  // datalistを更新する関数
  function updatePersonList() {
    const personList = document.getElementById('person-list');
    if (!personList) return;

    // 既存の名前を取得してユニークにする
    const uniquePersons = [...new Set(entries.map(e => e.person))];

    // datalistをクリアして再構築
    personList.innerHTML = '';
    uniquePersons.forEach(person => {
      const option = document.createElement('option');
      option.value = person;
      personList.appendChild(option);
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // ===== レンダリング関数 =====

  // 通常の行を表示
  function renderNormalRow(tr, e, idx) {
    const amount = Number(e.amount);
    const receiveTypes = ['香典', 'お祝い', 'お見舞い', 'お年玉'];
    const isReceive = receiveTypes.includes(e.type);
    const amountClass = isReceive ? 'positive' : 'negative';
    const sign = isReceive ? '+' : '-';

    // 関連情報の表示
    let relationInfo = '';
    if (e.type === 'お祝い' || e.type === 'お見舞い') {
      relationInfo = e.hasReturn ? '✓お返し済' : '未お返し';
    } else if (e.type === 'お返し' && e.relatedTo) {
      const relatedEntry = entries.find(entry => entry.id === e.relatedTo);
      if (relatedEntry) {
        relationInfo = `←${relatedEntry.date.substring(5)}の${relatedEntry.type}`;
      }
    }

    tr.innerHTML = `
      <td>${e.date}</td>
      <td class="${amountClass}">${sign}${formatYen(Math.abs(amount))}</td>
      <td>${escapeHtml(e.person)}</td>
      <td>${e.type}</td>
      <td class="relation-info">${relationInfo}</td>
      <td>
        <button data-index="${idx}" class="edit">編集</button>
        <button data-index="${idx}" class="delete">削除</button>
      </td>
    `;
  }

  // 編集中の行を表示
  function renderEditRow(tr, e, idx) {
    const amount = Number(e.amount);

    // 関連情報の表示（編集モードでも表示）
    let relationInfo = '';
    if (e.type === 'お祝い' || e.type === 'お見舞い') {
      relationInfo = e.hasReturn ? '✓お返し済' : '未お返し';
    } else if (e.type === 'お返し' && e.relatedTo) {
      const relatedEntry = entries.find(entry => entry.id === e.relatedTo);
      if (relatedEntry) {
        relationInfo = `←${relatedEntry.date.substring(5)}の${relatedEntry.type}`;
      }
    }

    tr.innerHTML = `
      <td><input type="date" class="edit-date" value="${e.date}" /></td>
      <td><input type="number" class="edit-amount" value="${amount}" step="0.01" /></td>
      <td><input type="text" class="edit-person" value="${escapeHtml(e.person)}" list="person-list" /></td>
      <td>
        <select class="edit-type">
          <option value="香典" ${e.type === '香典' ? 'selected' : ''}>香典</option>
          <option value="お祝い" ${e.type === 'お祝い' ? 'selected' : ''}>お祝い</option>
          <option value="お見舞い" ${e.type === 'お見舞い' ? 'selected' : ''}>お見舞い</option>
          <option value="お年玉" ${e.type === 'お年玉' ? 'selected' : ''}>お年玉</option>
          <option value="お礼" ${e.type === 'お礼' ? 'selected' : ''}>お礼</option>
          <option value="お返し" ${e.type === 'お返し' ? 'selected' : ''}>お返し</option>
          <option value="その他" ${e.type === 'その他' ? 'selected' : ''}>その他</option>
        </select>
      </td>
      <td class="relation-info">${relationInfo}</td>
      <td>
        <button data-index="${idx}" class="update">更新</button>
        <button data-index="${idx}" class="cancel">キャンセル</button>
      </td>
    `;

    // 最初の入力フィールドにフォーカス
    setTimeout(() => {
      const dateInput = tr.querySelector('.edit-date');
      if (dateInput) dateInput.focus();
    }, 0);
  }

  function render() {
    tableBody.innerHTML = '';
    entries.forEach((e, idx) => {
      const tr = document.createElement('tr');

      if (editingIndex === idx) {
        renderEditRow(tr, e, idx);
      } else {
        renderNormalRow(tr, e, idx);
      }

      tableBody.appendChild(tr);
    });

    // datalistを更新
    updatePersonList();
  }


  function save() {
    if (!entriesRef) {
      console.warn('未ログイン: データは保存されません');
      return;
    }

    const data = {};
    entries.forEach(entry => {
      // 更新日時を更新
      entry.updatedAt = Date.now();
      if (!entry.createdBy && window.firebaseAuth.currentUser) {
        entry.createdBy = window.firebaseAuth.currentUser.uid;
      }
      data[entry.id] = entry;
    });

    entriesRef.set(data)
      .then(() => {
        console.log('Firebaseに保存成功');
      })
      .catch(error => {
        console.error('保存エラー:', error);
        alert('データの保存に失敗しました。もう一度お試しください。');
      });
  }


  // ===== インライン編集関連 =====

  // インライン編集を開始
  function startInlineEdit(idx) {
    editingIndex = idx;
    render();
  }

  // インライン編集をキャンセル
  function cancelInlineEdit() {
    editingIndex = null;
    render();
  }

  // インライン編集を保存
  function saveInlineEdit(idx) {
    const tr = tableBody.querySelector(`tr:nth-child(${idx + 1})`);
    if (!tr) return;

    const date = tr.querySelector('.edit-date').value;
    const amount = parseFloat(tr.querySelector('.edit-amount').value) || 0;
    const person = tr.querySelector('.edit-person').value.trim();
    const type = tr.querySelector('.edit-type').value;

    if (!date || !person) {
      alert('日付と相手の名前は必須です');
      return;
    }

    entries[idx] = { ...entries[idx], date, amount, person, type };
    save();
    editingIndex = null;
    render();
  }

  // ===== お返し関連UI制御 =====

  // 関連エントリの候補を更新
  function updateRelatedEntryOptions() {
    const person = document.getElementById('entry-person').value.trim();
    const relatedSelect = document.getElementById('related-entry');

    relatedSelect.innerHTML = '<option value="">選択してください</option>';

    if (!person) return;

    // 同じ人のお祝い/お見舞いで、まだお返ししていないもの
    const candidates = entries.filter(e =>
      e.person === person &&
      (e.type === 'お祝い' || e.type === 'お見舞い') &&
      !e.hasReturn
    );

    candidates.forEach(e => {
      const option = document.createElement('option');
      option.value = e.id;
      option.textContent = `${e.person}さん ¥${e.amount.toLocaleString()} (${e.date.substring(5)} ${e.type})`;
      relatedSelect.appendChild(option);
    });
  }

  // UI初期化とイベントリスナー設定
  function initializeReturnUI() {
    const typeSelect = document.getElementById('entry-type');
    const returnSection = document.getElementById('return-section');
    const isReturnCheckbox = document.getElementById('is-return');
    const relatedSelectWrapper = document.getElementById('related-select-wrapper');
    const relatedSelect = document.getElementById('related-entry');
    const personInput = document.getElementById('entry-person');

    if (!typeSelect || !returnSection) return;

    // 種別変更時
    typeSelect.addEventListener('change', function () {
      if (this.value === 'お返し') {
        returnSection.style.display = 'block';
      } else {
        returnSection.style.display = 'none';
        isReturnCheckbox.checked = false;
        relatedSelectWrapper.style.display = 'none';
      }
    });

    // チェックボックス変更時
    isReturnCheckbox.addEventListener('change', function () {
      if (this.checked) {
        relatedSelectWrapper.style.display = 'block';
        updateRelatedEntryOptions();
      } else {
        relatedSelectWrapper.style.display = 'none';
        document.getElementById('entry-amount').value = '';
      }
    });

    // 相手の名前変更時、候補リストを更新
    personInput.addEventListener('input', function () {
      if (isReturnCheckbox.checked) {
        updateRelatedEntryOptions();
      }
    });

    // 関連エントリ選択時、半返し金額を自動設定
    relatedSelect.addEventListener('change', function () {
      if (!this.value) {
        document.getElementById('entry-amount').value = '';
        return;
      }

      const relatedEntry = entries.find(e => e.id === this.value);
      if (relatedEntry) {
        // 半返し金額を計算（四捨五入）
        const halfAmount = Math.round(relatedEntry.amount / 2);
        document.getElementById('entry-amount').value = halfAmount;
      }
    });
  }

  // ===== フォーム送信処理 =====

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const date = document.getElementById('entry-date').value;
      const amount = parseFloat(document.getElementById('entry-amount').value) || 0;
      const person = document.getElementById('entry-person').value.trim();
      const type = document.getElementById('entry-type').value;

      if (!date || !person) return;

      const newEntry = {
        id: generateId(),
        date,
        amount,
        person,
        type,
        relatedTo: null,
        hasReturn: false
      };

      // お返しの場合、関連IDを設定
      if (type === 'お返し' && document.getElementById('is-return').checked) {
        const relatedId = document.getElementById('related-entry').value;
        if (relatedId) {
          newEntry.relatedTo = relatedId;

          // 元のお祝い/お見舞いのhasReturnをtrueに更新
          const relatedEntry = entries.find(e => e.id === relatedId);
          if (relatedEntry) {
            relatedEntry.hasReturn = true;
          }
        }
      }

      // 常に新しいエントリを追加
      entries.push(newEntry);
      form.reset();
      setTodayDate(); // 日付を今日に設定
      document.getElementById('entry-date').focus();

      save();
      render();
    });

    // テーブル内のボタンクリック処理
    tableBody.addEventListener('click', function (e) {
      const btn = e.target.closest('button');
      if (!btn) return;

      const idx = Number(btn.dataset.index);
      if (Number.isNaN(idx)) return;

      if (btn.classList.contains('edit')) {
        // 編集ボタン
        startInlineEdit(idx);
      } else if (btn.classList.contains('delete')) {
        // 削除ボタン
        if (confirm('このエントリを削除してもよろしいですか?')) {
          const deletedEntry = entries[idx];

          // お返しを削除する場合、元のお祝い/お見舞いのhasReturnをfalseに戻す
          if (deletedEntry.type === 'お返し' && deletedEntry.relatedTo) {
            const relatedEntry = entries.find(e => e.id === deletedEntry.relatedTo);
            if (relatedEntry) {
              relatedEntry.hasReturn = false;
            }
          }

          // お祝い/お見舞いを削除する場合、関連するお返しも削除するか確認
          if ((deletedEntry.type === 'お祝い' || deletedEntry.type === 'お見舞い') && deletedEntry.hasReturn) {
            const relatedReturn = entries.find(e => e.relatedTo === deletedEntry.id);
            if (relatedReturn && confirm('関連するお返しも削除しますか？')) {
              entries = entries.filter(e => e.id !== relatedReturn.id && e.id !== deletedEntry.id);
            } else {
              // お返しは削除せず、関連を解除
              if (relatedReturn) {
                relatedReturn.relatedTo = null;
              }
              entries.splice(idx, 1);
            }
          } else {
            entries.splice(idx, 1);
          }

          save();
          editingIndex = null; // 編集中の状態をリセット
          render();
        }
      } else if (btn.classList.contains('update')) {
        // 更新ボタン
        saveInlineEdit(idx);
      } else if (btn.classList.contains('cancel')) {
        // キャンセルボタン
        cancelInlineEdit();
      }
    });
  }

  // ===== エクスポート/インポート機能 =====

  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');

  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      // CSV形式でエクスポート
      let csv = '日付,金額,誰に/誰から,種別\n';

      entries.forEach(e => {
        const amount = Number(e.amount);
        const receiveTypes = ['香典', 'お祝い', 'お見舞い', 'お年玉'];
        const isReceive = receiveTypes.includes(e.type);
        const sign = isReceive ? '+' : '-';
        const displayAmount = `${sign}${amount}`;

        // CSVエスケープ（カンマや改行を含む場合はダブルクォートで囲む）
        const escapeCsv = (field) => {
          if (!field) return '';
          const str = String(field);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replaceAll('"', '""') + '"';
          }
          return str;
        };

        csv += `${e.date},${displayAmount},${escapeCsv(e.person)},${escapeCsv(e.type)}\n`;
      });

      // BOM付きUTF-8でエクスポート（Excelで文字化けしないように）
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cashbook_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  if (importBtn && importFile) {
    importBtn.addEventListener('click', function () {
      importFile.click();
    });

    importFile.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const csv = event.target.result;
          const lines = csv.split('\n');

          // ヘッダー行をスキップ
          const dataLines = lines.slice(1).filter(line => line.trim());

          const importedData = dataLines.map(line => {
            // CSVパース（簡易版、カンマで分割）
            const cols = line.split(',').map(c => c.trim());
            if (cols.length < 4) return null;

            const [date, amountStr, person, type] = cols;

            // 金額から符号を除去
            const amount = parseFloat(amountStr.replace(/[+\-¥,]/g, ''));

            return {
              id: generateId(),
              date,
              amount,
              person,
              type,
              relatedTo: null,
              hasReturn: false
            };
          }).filter(e => e !== null);

          if (importedData.length > 0) {
            if (confirm(`${importedData.length}件のエントリをインポートします。既存のデータに追加されます。よろしいですか?`)) {
              entries = entries.concat(importedData);
              save();
              render();
              alert('データを正常にインポートしました');
            }
          } else {
            alert('有効なデータが見つかりませんでした');
          }
        } catch (error) {
          alert('ファイルの読み込みに失敗しました: ' + error.message);
        }
      };
      reader.readAsText(file);
      importFile.value = ''; // Reset file input
    });
  }



  // ===== LocalStorageからFirebaseへのデータ移行 =====

  async function migrateFromLocalStorage(familyId) {
    // 既に移行済みか確認
    if (localStorage.getItem(MIGRATION_KEY)) {
      console.log('既にFirebaseに移行済みです');
      return;
    }

    // LocalStorageからデータ取得
    const localData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (localData.length > 0) {
      const confirmed = confirm(
        `ローカルに保存されている${localData.length}件のデータをクラウドに移行しますか？\n\n移行すると、家族メンバー全員とデータを共有できます。`
      );

      if (confirmed) {
        const db = window.firebaseDatabase;
        const data = {};

        localData.forEach(entry => {
          if (!entry.id) entry.id = generateId();
          if (!entry.createdBy) entry.createdBy = window.firebaseAuth.currentUser.uid;
          if (!entry.updatedAt) entry.updatedAt = Date.now();
          if (!entry.relatedTo) entry.relatedTo = null;
          if (entry.hasReturn === undefined) entry.hasReturn = false;
          data[entry.id] = entry;
        });

        try {
          await db.ref(`cashbook/${familyId}`).set(data);
          console.log('データ移行完了:', localData.length, '件');
          alert(`${localData.length}件のデータをクラウドに移行しました！`);
        } catch (error) {
          console.error('移行エラー:', error);
          alert('データ移行中にエラーが発生しました: ' + error.message);
          return; // 移行失敗時はフラグを立てない
        }
      }
    }

    // 移行完了フラグを設定（ユーザーが拒否した場合も設定）
    localStorage.setItem(MIGRATION_KEY, 'true');
  }

  // ===== Firebase初期化（ログイン後に呼ばれる） =====

  window.onUserLoggedIn = async function (user, familyId) {
    console.log('出納帳: ユーザーログイン検知', user.displayName, familyId);

    currentFamilyId = familyId;
    entriesRef = window.firebaseDatabase.ref(`cashbook/${familyId}`);

    // Firebaseリスナー設定（リアルタイム同期）
    entriesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      entries = data ? Object.values(data) : [];

      // データマイグレーション実行（初回のみ）
      migrateData();

      render();
      console.log('Firebaseからデータ取得:', entries.length, '件');
    });

    // LocalStorageからの移行（初回のみ）
    await migrateFromLocalStorage(familyId);
  };

  // ===== 初期化 =====

  // お返しUIの初期化
  initializeReturnUI();

  // 初期表示時に日付フィールドに今日の日付を設定
  setTodayDate();

  // 未ログインの場合はメッセージ表示
  if (!window.firebaseAuth || !window.firebaseAuth.currentUser) {
    console.log('未ログイン: Googleでログインしてください');
  }
})();
