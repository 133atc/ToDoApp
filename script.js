    
    
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const list = document.getElementById('list');
    const themeToggle = document.getElementById('theme-toggle');

    
    let todos = [];         
    let nextId = 1;

    const STORAGE_KEY = 'todos:v1';
    const THEME_KEY = 'theme';

    function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }
    function load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          todos = data.map(t => ({ id: Number(t.id), text: String(t.text || ''), completed: Boolean(t.completed) }));
          nextId = todos.reduce((m, t) => Math.max(m, t.id), 0) + 1;
        }
      } catch (_) { todos = []; }
    }

    
    function svg(name) {
      const attrs = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      const paths = {
        check: '<polyline points="20 6 9 17 4 12"/>',
        edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
        trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'
      };
      return `<svg ${attrs}>${paths[name] || ''}</svg>`;
    }

    
    function renderTodo(todo) {
      const li = document.createElement('li');
      li.dataset.id = String(todo.id);
      if (todo.completed) li.classList.add('completed');
      li.classList.add('appear');
      li.addEventListener('animationend', () => li.classList.remove('appear'), { once: true });

      const label = document.createElement('span');
      label.className = 'text';
      label.textContent = todo.text;

      const actions = document.createElement('div');
      actions.className = 'actions';

      const doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.className = 'btn btn-ghost icon';
      doneBtn.setAttribute('aria-label', 'Toggle done');
      doneBtn.innerHTML = svg('check');

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-ghost icon';
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.innerHTML = svg('edit');

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-ghost icon danger';
      delBtn.setAttribute('aria-label', 'Delete task');
      delBtn.innerHTML = svg('trash');

      actions.append(doneBtn, editBtn, delBtn);
      li.append(label, actions);
      list.appendChild(li);

      
      doneBtn.addEventListener('click', () => {
        todo.completed = !todo.completed;
        li.classList.toggle('completed');
        save();
      });

      delBtn.addEventListener('click', () => {
        removeTodoById(todo.id);
        li.remove();
        save();
      });

      editBtn.addEventListener('click', () => beginEdit(todo, li, label));
      label.addEventListener('dblclick', () => beginEdit(todo, li, label));
    }

    function beginEdit(todo, li, label) {
      if (li.classList.contains('editing')) return;
      li.classList.add('editing');

      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'edit-input';
      editInput.value = todo.text;

      li.replaceChild(editInput, label);
      editInput.focus();
      const len = editInput.value.length; editInput.setSelectionRange(len, len);

      const commit = () => {
        const next = editInput.value.trim();
        if (!next) { cancel(); return; }
        todo.text = next; save();
        label.textContent = next;
        li.replaceChild(label, editInput);
        li.classList.remove('editing');
      };
      const cancel = () => { li.replaceChild(label, editInput); li.classList.remove('editing'); };

      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commit();
        else if (e.key === 'Escape') cancel();
      });
      editInput.addEventListener('blur', commit);
    }

   
    function addTodo(text) {
      const trimmed = String(text).trim();
      if (!trimmed) { input.focus(); return; }
      const todo = { id: nextId++, text: trimmed, completed: false };
      todos.push(todo);
      renderTodo(todo);
      save();
      input.value = '';
      input.focus();
    }

    function removeTodoById(id) { const idx = todos.findIndex(t => t.id === id); if (idx !== -1) todos.splice(idx, 1); }

    
    function applyTheme(t) { document.body.dataset.theme = t; }
    function loadTheme() {
      let t = localStorage.getItem(THEME_KEY);
      if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(t);
    }
    function toggleTheme() {
      const next = (document.body.dataset.theme === 'dark') ? 'light' : 'dark';
      applyTheme(next); localStorage.setItem(THEME_KEY, next);
    }

   
    function renderAll() { list.innerHTML = ''; todos.forEach(renderTodo); }

    load();
    renderAll();
    loadTheme();

   
    addBtn.addEventListener('click', () => addTodo(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(input.value); });
    themeToggle.addEventListener('click', toggleTheme);

   
    input.focus();