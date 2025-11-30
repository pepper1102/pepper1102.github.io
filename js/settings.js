// Settings page logic
(function () {
    const SETTINGS_KEY = 'appSettings';

    // Get DOM elements
    const appNameInput = document.getElementById('app-name');
    const themeSelect = document.getElementById('theme');
    const enableNotificationsCheck = document.getElementById('enable-notifications');
    const reminderEventsCheck = document.getElementById('reminder-events');
    const saveBtn = document.getElementById('save-settings-btn');

    // Data clear buttons
    const clearTasksBtn = document.getElementById('clear-tasks-btn');
    const clearCashbookBtn = document.getElementById('clear-cashbook-btn');
    const clearEventsBtn = document.getElementById('clear-events-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');

    // Load settings
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
            appName: 'MyHomeManager',
            theme: 'light',
            enableNotifications: false,
            reminderEvents: false
        };

        appNameInput.value = settings.appName;
        themeSelect.value = settings.theme;
        enableNotificationsCheck.checked = settings.enableNotifications;
        reminderEventsCheck.checked = settings.reminderEvents;
    }

    // Save settings
    function saveSettings() {
        const settings = {
            appName: appNameInput.value,
            theme: themeSelect.value,
            enableNotifications: enableNotificationsCheck.checked,
            reminderEvents: reminderEventsCheck.checked
        };

        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

        // Show confirmation
        alert('設定を保存しました');
    }

    // Clear data functions
    function clearTasks() {
        if (confirm('本当にすべてのタスクデータを削除しますか?この操作は取り消せません。')) {
            localStorage.removeItem('tasks');
            alert('タスクデータを削除しました');
        }
    }

    function clearCashbook() {
        if (confirm('本当にすべての出納帳データを削除しますか?この操作は取り消せません。')) {
            localStorage.removeItem('cashbookEntries');
            alert('出納帳データを削除しました');
        }
    }

    function clearEvents() {
        if (confirm('本当にすべてのカレンダーイベントを削除しますか?この操作は取り消せません。')) {
            localStorage.removeItem('calendarEvents');
            alert('カレンダーイベントを削除しました');
        }
    }

    function clearAll() {
        if (confirm('本当にすべてのアプリデータを削除しますか?この操作は取り消せません。')) {
            if (confirm('最終確認: すべてのデータが完全に削除されます。続行しますか?')) {
                localStorage.clear();
                alert('すべてのデータを削除しました');
                loadSettings(); // Reload default settings
            }
        }
    }

    // Event listeners
    saveBtn.addEventListener('click', saveSettings);
    clearTasksBtn.addEventListener('click', clearTasks);
    clearCashbookBtn.addEventListener('click', clearCashbook);
    clearEventsBtn.addEventListener('click', clearEvents);
    clearAllBtn.addEventListener('click', clearAll);


    // Initial load
    loadSettings();
})();
