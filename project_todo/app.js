/*
tutorial from video
https://www.youtube.com/watch?v=Ttf3CEsEwMQ
*/


// selectors
const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');

// event listener
document.addEventListener('DOMContentLoaded', getTodos)
todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', deleteTodo);
filterOption.addEventListener('click', filterTodo);

// functions
function addTodo(event) {
  // prevent form from submitting
  event.preventDefault();

  // ToDo div - populate the div with content
  const todoDiv = document.createElement('div');
  todoDiv.classList.add('todo');

  // create li
  const newTodo = document.createElement('li');
  newTodo.innerText = todoInput.value;
  newTodo.classList.add('todo-item');
  todoDiv.appendChild(newTodo);

  // add to local localStorage
  saveLocalToDos(todoInput.value);

  // complete buttons
  const completedButton = document.createElement('button');
  completedButton.innerHTML = '<i class="fas fa-check"></i>';
  completedButton.classList.add('complete-button');
  todoDiv.appendChild(completedButton);

  // delete button
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.classList.add('trash-button');
  todoDiv.appendChild(deleteButton);

  // append to list
  todoList.appendChild(todoDiv);

  // clear todo input values
  todoInput.value = "";
}

function deleteTodo(event) {
  // console.log(event.target);
  const item = event.target;

  // delete
  if (item.classList[0] === 'trash-button') {
    const todo = item.parentElement;
    // animation
    todo.classList.add('fall');
    removeLocalTodos(todo);
    todo.addEventListener('transitionend', function() {
      todo.remove();
    });
  };

  // completed
  if (item.classList[0] === 'complete-button') {
    const todo = item.parentElement;
    todo.classList.toggle('completed');
  }
}

function filterTodo(event) {
  // child of the ul list
  const todos = todoList.childNodes;
  todos.forEach(function(todo){
    switch (event.target.value) {
      case 'all':
        todo.style.display = 'flex';
        break;
      case 'completed':
        if(todo.classList.contains('completed')){
          console.log(todos);
          todo.style.display = 'flex';
        } else {
          todo.style.display = 'none';
        }
        break;
      case 'uncompleted':
        if(!todo.classList.contains('completed')){
          todo.style.display = 'flex';
        } else {
          todo.style.display = 'none';
        }
        break;
    }
  });
}

function saveLocalToDos(todo) {
  // check if i have a local storage
  let todos;
  if (localStorage.getItem('todos') === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem('todos'));
  }
  todos.push(todo)
  localStorage.setItem('todos', JSON.stringify(todos));
}

function getTodos() {
  let todos;
  if (localStorage.getItem('todos') === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem('todos'));
  }
  todos.forEach(function(todo) {
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo');

    // create li
    const newTodo = document.createElement('li');
    newTodo.innerText = todo;
    newTodo.classList.add('todo-item');
    todoDiv.appendChild(newTodo);

    // complete buttons
    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fas fa-check"></i>';
    completedButton.classList.add('complete-button');
    todoDiv.appendChild(completedButton);

    // delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.classList.add('trash-button');
    todoDiv.appendChild(deleteButton);

    // append to list
    todoList.appendChild(todoDiv);
  });
}

function removeLocalTodos(todo){
  let todos;
  console.log(todo);
  if (localStorage.getItem('todos') === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem('todos'));
  }
  const todoIndex = todo.children[0].innerText;
  todos.splice(todos.indexOf(todoIndex), 1);
  localStorage.setItem('todos', JSON.stringify(todos));
}
