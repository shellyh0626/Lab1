let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];

function persistTodos () {
  localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * render all todo items
 */
function renderTodos () {
  persistTodos();
  let container = document.getElementById('todos');
  // clear container first
  container.innerHTML = '';

  // render every todo
  for (let todo of todos) {
    let div = document.createElement('div');
    div.className = `alert alert-${todo.status === 1 ? 'dark' : todo.p} alert-dismissible `;
    div.setAttribute('data-id', todo.id);
    div.innerHTML = `
<div class="todo-row">
<input ${todo.status === 1 ? 'checked="checked"' : ''} class="form-check-input" type="checkbox" value=""  data-action="check-task" data-id="${todo.id}">

<div class="todo-row-content">
    <div class="${todo.status === 1 ? 'todo-done' : ''}">[Due ${todo.due}] ${todo.task}</div>

    <div class="mt-2">
        <ul>
            ${todo.children.map(c => `
            <li>
                <div class="todo-row">
                    <input ${c.status === 1 ? 'checked="checked"' : ''} class="form-check-input" type="checkbox" value="" data-action="check-sub" data-pid="${todo.id}" data-id="${c.id}">
                    <div class="todo-row-content">
                        <span class="${c.status === 1 ? 'todo-done' : ''}">${c.task}</span> <span class="ms-2 cursor-pointer text-danger" data-action="remove-sub" data-pid="${todo.id}" data-id="${c.id}">×</span>
                    </div>
                </div>
            </li>
            `).join('')}
        </ul>


        <div class="mt-2 input-group input-group-sm">
            <input type="text" class="form-control" placeholder="Add subtasks if any..." data-action="sub-input" data-id="${todo.id}">
            <button class="btn btn-${todo.p}" type="button" id="button-addon2" data-action="add-sub" data-id="${todo.id}">Add</button>
        </div>

    </div>
</div>
</div>
  <button type="button" class="btn-close" data-action="remove-task" data-id="${todo.id}"></button>
  `;

    // append to container
    container.appendChild(div);
  }
}

/**
 * on add form submit
 */
document.getElementById('add-todo').addEventListener('submit', e => {
  // prevent page reload
  e.preventDefault();
  // push to list
  todos.push({
    task: document.getElementById('task').value,
    due: document.getElementById('due').value,
    p: document.getElementById('p').value,
    status: 0,
    children: [],
    id: Date.now()
  });
  // re-render list
  renderTodos();
  // reset the form
  e.target.reset();
});

/**
 * a delegate for all click events in todo list
 */
document.addEventListener('click', e => {
  let action = e.target.getAttribute('data-action');
  let id = e.target.getAttribute('data-id');
  let pid = e.target.getAttribute('data-pid');

  if (action === 'remove-task') {
    // remove a todo task
    todos.splice(todos.findIndex(v => v.id.toString() === id), 1);
    renderTodos();
  } else if (action === 'remove-sub') {
    // remove a sub todo task
    let todo = todos.find(v => v.id.toString() === pid);
    todo.children.splice(todo.children.findIndex(v => v.id.toString() === id), 1);
    renderTodos();
  } else if (action === 'add-sub') {
    // add a sub todo task
    let todo = todos.find(v => v.id.toString() === id);
    let value = document.querySelector(`[data-action="sub-input"][data-id="${todo.id}"]`).value;
    if (!value) {
      // input is empty, ignore
      return;
    }

    todo.children.push({
      id: Date.now(),
      task: value,
      status: 0,
    });
    renderTodos();
  } else if (action === 'check-sub') {
    // check on sub todo task
    let done = e.target.checked;
    let todo = todos.find(v => v.id.toString() === pid);
    // set sub task to check/uncheck
    todo.children.find(v => v.id.toString() === id).status = done ? 1 : 0;
    renderTodos();
  } else if (action === 'check-task') {
    // check on task
    let done = e.target.checked;
    let todo = todos.find(v => v.id.toString() === id);
    // set all sub todos to check/uncheck
    todo.children.forEach(c => {
      c.status = done ? 1 : 0;
    });
    // set itself to check/uncheck
    todo.status = done ? 1 : 0;
    if (done) {
      // perform a shake effect
      setTimeout(() => {
        let node = document.querySelector(`.alert[data-id="${todo.id}"]`);
        node.classList.add('bounce');
      }, 100);
    }
    renderTodos();
  }
});

renderTodos();