gsap.from('.container', {
  opacity: 0,
  y: -20,
  duration: 1.5,
  delay: 0,
  ease: "power2.out",
})
const API_URL = 'https://dummyjson.com/todos';
const ADD_API_URL = 'https://dummyjson.com/todos/add';

const todoList = document.getElementById('todoList');
const todoForm = document.getElementById('todoForm');
const todoTitle = document.getElementById('todoTitle');
const searchInput = document.getElementById('searchInput');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const loading = document.getElementById('loading');
const pagination = document.getElementById('pagination');

let allTodos = [];

let currentPage = 1;
const TODOS_PER_PAGE = 10;



function showLoading() {
  loading.style.display = 'block';
}

function hideLoading() {
  loading.style.display = 'none';
}

async function fetchTodos() {
  try {
    showLoading();
    const res = await fetch(API_URL);
    const data = await res.json();
    allTodos = data.todos;
    renderTodos();
    setupPagination();
  } catch (err) {
    alert('Error fetching todos');
  } finally {
    hideLoading();
  }
}

function renderTodos() {
  const searchTerm = searchInput.value.toLowerCase();
  const from = fromDate.value;
  const to = toDate.value;

  let filtered = allTodos.filter(todo =>
    todo.todo.toLowerCase().includes(searchTerm)
  );

  if (from && to) {
    filtered = filtered.filter(todo => {
      const date = new Date(todo.createdAt || new Date());
      return date >= new Date(from) && date <= new Date(to);
    });
  }

  const start = (currentPage - 1) * TODOS_PER_PAGE;
  const end = start + TODOS_PER_PAGE;
  const visibleTodos = filtered.slice(start, end);

  if (visibleTodos.length === 0) {
    todoList.innerHTML = `<p class="noresult">No result found</p>`
    return;
  }

  todoList.innerHTML = '';
  visibleTodos.forEach(todo => {
    const li = document.createElement('li');
    li.textContent = todo.todo;
    todoList.appendChild(li);

    gsap.from(li, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      delay: 0.4,
      ease: "power2.out",
    })
  });
}

todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = todoTitle.value.trim();
  if (!title) return;

  try {
    showLoading();
    const res = await fetch(ADD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo: title,
        completed: false,
        userId: 1,
      }),
    });
    const newTodo = await res.json();
    allTodos.unshift(newTodo);
    todoTitle.value = '';
    renderTodos();
    setupPagination();
  } catch (err) {
    alert('Failed to add todo');
  } finally {
    hideLoading();
  }
});

searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderTodos();
  setupPagination();
});

fromDate.addEventListener('change', () => {
  currentPage = 1;
  renderTodos();
});

toDate.addEventListener('change', () => {
  currentPage = 1;
  renderTodos();
});

function setupPagination() {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(
    allTodos.filter(todo =>
      todo.todo.toLowerCase().includes(searchInput.value.toLowerCase())
    ).length / TODOS_PER_PAGE
  );

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.toggle('active', i === currentPage);
    btn.addEventListener('click', () => {
      currentPage = i;
      renderTodos();
      setupPagination();
    });
    pagination.appendChild(btn);
    gsap.from(btn, { opacity: 0, y: 10, duration: 0.3 })
  }
}

fetchTodos();
