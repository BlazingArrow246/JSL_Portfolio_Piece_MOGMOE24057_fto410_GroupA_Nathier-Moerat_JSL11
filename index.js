// TASK: import helper functions from utils
// TASK: import initialData

import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';

import { initialData } from './initialData.js';
// Your program's logic starts here
/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', true)   
  } else {
    console.log('Data already exists in localStorage');
  }
}

window.onload = function() {
  initializeData();  // Calling the function
};

// TASK: Get elements from the DOM
let elements = {};
document.addEventListener("DOMContentLoaded", function () { const elements = {
    // Sidebar container
    sideBar: document.getElementById('side-bar-div'),

    // Logo container in the sidebar
    sideLogoDiv: document.getElementById('side-logo-div'),
  
    // Boards navigation links container
    boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  
    // Board name displayed in header (active board)
    headerBoardName: document.getElementById('header-board-name'),  
    
    // Theme switcher (checkbox and icons)
    themeSwitch: document.getElementById('switch'),
    iconDark: document.getElementById('icon-dark-theme'),
    iconLight: document.getElementById('icon-light-theme'),
  
    // Sidebar hide button and icon
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    iconHideSidebar: document.getElementById('icon-hide-sidebar'),
  
    // Modal window elements
    modalWindow: document.getElementById('task-modal'),  
    editTaskModal: document.getElementById('edit-task-modal'),  
  
    // Filter overlay
    filterDiv: document.getElementById('filterDiv'),  
    
    // Task buttons
    createNewTaskBtn: document.getElementById('create-new-task-btn'),  
};
init();
console.log(elements)
}); 

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; //Wrong ternary used... ; instead of :
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    boardElement.addEventListener("click" ,() =>  { //Added event listener and correct syntax in function
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); //Added x2 equals signs

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDiv.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { //Added equal signs x2 for filter
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);
    
      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click",() => { //Corrected event listener bug
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
};

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') //Fixed missing "classlist"
    }
    else {
      btn.classList.remove('active'); //Fixed missing "classlist"
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}`);//Replaced qoutes with back ticks 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); //Added missing argument: taskElement
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener ("click", () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click",() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; //Wrong ternary operator ; instead of :
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: taskTitle,
      description: taskDescription,
      status: taskStatus, //come back later, might need to add buttons
    };
      
    
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    };
  }



function toggleSidebar(show) {const sidebar = document.getElementById('side-bar-div'); // Get the sidebar element
  if (show) {
    sidebar.style.display = 'block';  // Show the sidebar if 'show' is true
  } else {
    sidebar.style.display = 'none';   // Hide the sidebar if 'show' is false
  }
}


function toggleTheme() {const body = document.body;  // Get the body element
  const currentTheme = body.classList.contains('dark-theme');  // Check if the body has the 'dark-theme' class

  if (currentTheme) {
    body.classList.remove('dark-theme');  // Remove the dark theme class
    localStorage.setItem('theme', 'light'); // Store the preference in localStorage
  } else {
    body.classList.add('dark-theme');  // Add the dark theme class
    localStorage.setItem('theme', 'dark'); // Store the preference in localStorage
  }
 
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.querySelector('#edit-task-title-input').value = task.title;
  document.querySelector('#edit-task-desc-input').value = task.description;
  document.querySelector('#edit-select-status').value = task.status;

  // Get button elements from the task modal
  const saveButton = document.querySelector('#save-task-changes-btn');
  const cancelButton = document.querySelector('#cancel-edit-btn');
  const deleteButton = document.querySelector('#delete-task-btn');

  saveButton.onclick = function() {
    const updatedTask = {
      ...task, // Keep existing task properties
      title: document.querySelector('#edit-task-title-input').value,
      description: document.querySelector('#edit-task-desc-input').value,
      status: document.querySelector('#edit-select-status').value
    };
  

  // Call saveTaskChanges upon click of Save Changes button
  saveTaskChanges(updatedTask);  // This function needs to be defined elsewhere to save the task changes
    toggleModal(false, elements.editTaskModal); // Close the edit modal after saving
    refreshTasksUI(); // Optionally refresh the UI to reflect changes
  };
  cancelButton.onclick = function() {
    toggleModal(false, elements.editTaskModal); // Close the modal
  };

  // Delete task using a helper function and close the task modal
  deleteButton.onclick = function() {
    deleteTask(task.id); // Assuming task has an 'id' property to identify it
    toggleModal(false, elements.editTaskModal); // Close the edit modal after deleting
    refreshTasksUI(); // Optionally refresh the UI to remove the task
  };


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = document.querySelector('#edit-task-title-input').value;
  const updatedDescription = document.querySelector('#edit-task-desc-input').value;
  const updatedStatus = document.querySelector('#edit-select-status').value;

  // Create an object with the updated task details
  const updatedTask = {
    ...task, // Keep existing task properties
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus
};

  // Update task using a hlper functoin
 
  updateTask(updatedTask);
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal); // Close the modal
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}