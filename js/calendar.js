// Calendar page logic
(function() {
  const STORAGE_KEY = 'calendarEvents';
  let events = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let currentDate = new Date();

  const calendarGrid = document.getElementById('calendar-grid');
  const currentMonthEl = document.getElementById('current-month');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const addEventForm = document.getElementById('add-event-form');
  const eventsList = document.getElementById('events-list');

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = `${year}年 ${monthNames[month]}`;

    // Clear grid
    calendarGrid.innerHTML = '';

    // Add day headers
    weekDays.forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-day header';
      header.textContent = day;
      calendarGrid.appendChild(header);
    });

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dayEl = createDayElement(day, true, new Date(year, month - 1, day));
      calendarGrid.appendChild(dayEl);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEl = createDayElement(day, false, date);
      
      // Check if today
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        dayEl.classList.add('today');
      }

      calendarGrid.appendChild(dayEl);
    }

    // Next month days to fill the grid
    const totalCells = calendarGrid.children.length - 7; // Subtract headers
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const dayEl = createDayElement(day, true, new Date(year, month + 1, day));
      calendarGrid.appendChild(dayEl);
    }
  }

  function createDayElement(day, isOtherMonth, date) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    if (isOtherMonth) dayEl.classList.add('other-month');

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);

    // Check for events on this day
    const dateStr = formatDate(date);
    const dayEvents = events.filter(e => e.date === dateStr);
    
    if (dayEvents.length > 0) {
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'day-events';
      dayEvents.forEach(event => {
        const dot = document.createElement('span');
        dot.className = 'event-dot';
        dot.title = event.title;
        eventsContainer.appendChild(dot);
      });
      dayEl.appendChild(eventsContainer);
    }

    return dayEl;
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function renderEventsList() {
    eventsList.innerHTML = '';
    
    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.date + (a.time ? ' ' + a.time : ''));
      const dateB = new Date(b.date + (b.time ? ' ' + b.time : ''));
      return dateA - dateB;
    });

    // Filter future events
    const now = new Date();
    const futureEvents = sortedEvents.filter(e => new Date(e.date) >= now);

    if (futureEvents.length === 0) {
      const li = document.createElement('li');
      li.textContent = '予定されているイベントはありません';
      li.style.color = '#999';
      eventsList.appendChild(li);
      return;
    }

    futureEvents.forEach((event, index) => {
      const li = document.createElement('li');
      
      const info = document.createElement('div');
      info.className = 'event-info';
      
      const dateSpan = document.createElement('span');
      dateSpan.className = 'event-date';
      dateSpan.textContent = event.date;
      
      const titleSpan = document.createElement('span');
      titleSpan.className = 'event-title';
      titleSpan.textContent = event.title;
      
      info.appendChild(dateSpan);
      info.appendChild(titleSpan);
      
      if (event.time) {
        const timeSpan = document.createElement('span');
        timeSpan.className = 'event-time';
        timeSpan.textContent = event.time;
        info.appendChild(timeSpan);
      }
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-event-btn';
      deleteBtn.textContent = '削除';
      deleteBtn.onclick = () => deleteEvent(event);
      
      li.appendChild(info);
      li.appendChild(deleteBtn);
      eventsList.appendChild(li);
    });
  }

  function deleteEvent(event) {
    events = events.filter(e => !(e.date === event.date && e.title === event.title && e.time === event.time));
    saveEvents();
    renderCalendar();
    renderEventsList();
  }

  // Event listeners
  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  addEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('event-date').value;
    const title = document.getElementById('event-title').value.trim();
    const time = document.getElementById('event-time').value;

    if (!date || !title) return;

    events.push({ date, title, time });
    saveEvents();
    
    addEventForm.reset();
    renderCalendar();
    renderEventsList();
  });

  // Sidebar controls
  (function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    const overlay = document.getElementById('overlay');

    if (!sidebar || !toggleBtn) return;

    function openSidebar() {
      sidebar.classList.add('open');
      sidebar.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (overlay) { overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add('visible')); }
      const firstLink = sidebar.querySelector('nav a'); if (firstLink) firstLink.focus();
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (overlay) { overlay.classList.remove('visible'); setTimeout(() => overlay.hidden = true, 250); }
      toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', function() { if (sidebar.classList.contains('open')) closeSidebar(); else openSidebar(); });
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar(); });
  })();

  // Initial render
  renderCalendar();
  renderEventsList();
})();
