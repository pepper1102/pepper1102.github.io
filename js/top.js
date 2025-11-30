
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const taskTitle = document.getElementById('task-title');
    const taskCategory = document.getElementById('task-category');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function renderTasks() {
      taskList.innerHTML = '';
      tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${task.title} [${task.category}]</span>
          <button onclick="deleteTask(${index})">削除</button>
        `;
        taskList.appendChild(li);
      });
    }

    function deleteTask(index) {
      tasks.splice(index, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    }

    taskForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const newTask = {
        title: taskTitle.value,
        category: taskCategory.value
      };
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      taskTitle.value = '';
      renderTasks();
    });

    renderTasks();

    // --- Sidebar controls ---
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
        if (overlay) {
          overlay.hidden = false;
          // allow CSS transition
          requestAnimationFrame(() => overlay.classList.add('visible'));
        }
        const firstLink = sidebar.querySelector('nav a');
        if (firstLink) firstLink.focus();
      }

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

      toggleBtn.addEventListener('click', function() {
        if (sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
      });

      if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
      if (overlay) overlay.addEventListener('click', closeSidebar);

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
          closeSidebar();
        }
      });
    })();
