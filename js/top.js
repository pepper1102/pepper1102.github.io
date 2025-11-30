
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

taskForm.addEventListener('submit', function (e) {
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
