// TASK: import helper functions from utils
// TASK: import initialData

import { getTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";

import { initialData } from './initialData.js';


// Your program's logic starts here
/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

let activeBoard = ""; 

// Function checks if local storage already has data, if not it loads initialData to localStorage

function initializeData() {  // Checks if "tasks" exists in localStorage,if not,the function skips initialization to avoid overwriting user data.
  if (!localStorage.getItem("tasks")) {
    console.log("Setting initial data in localStorage...");
    console.log("Initial Data:", initialData); // Debugging 

    localStorage.setItem("tasks", JSON.stringify(initialData)); 
    localStorage.setItem("showSideBar", true);
  } else {
    console.log('Data already exists in localStorage:', localStorage.getItem('tasks'));
  }
}
//LOCAL STORAGE
function clearLocalStorage() {  //clear local storage button
  localStorage.clear();
  console.log("Local storage cleared. Refreshing the page...");
  location.reload(); // Refresh the page to reinitialize data
}
document.getElementById("clear-storage-btn").addEventListener("click", clearLocalStorage);

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  filterDiv: document.getElementById("filterDiv"),
  columnDivs: document.querySelectorAll(".column-div"),
  //sidebar elements
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  //theme switch element
  themeSwitch: document.getElementById("switch"),
  //Task elements
  editTaskModal: document.getElementById("edit-btn"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.querySelector(".modal-window"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  dropDownBtn: document.getElementById("dropdownBtn"),
};
    init();
    console.log(elements);
;

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  
  //Retrieves tasks from local storage,returns with board properties.
  const tasks = getTasks();  

  //Extracts unique board names from tasks
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; //Wrong ternary used... ; instead of :
    elements.headerBoardName.textContent = activeBoard;
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
  const filteredTasks = tasks.filter((task) => task.board === boardName); //Added x2 equals signs

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    filteredTasks
    .filter((task) => task.status === status)
    .forEach((task)=> { //Added equal signs x2 for filter
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
  document.querySelectorAll('.board-btn').forEach((btn) => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') //Fixed missing "classlist"
    }
    else {
      btn.classList.remove('active'); //Fixed missing "classlist"
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);

  //Replaced qoutes with back ticks 
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
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // mobile sidebar
  elements.dropDownBtn.addEventListener("click", () => {
    if (localStorage.getItem("showSideBar") === "true") {
      toggleSidebar(false);
      document.getElementById("dropDownIcon").src =
        "./assets/icon-chevron-down.svg";
    } else {
      toggleSidebar(true);
      document.getElementById("dropDownIcon").src =
        "./assets/icon-chevron-up.svg";
    }
  });

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", addTask);

  };


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
      title: document.getElementById("title-input").value,
      description: document.getElementById("desc-input").value,
      status: document.getElementById("select-status").value,
      board: activeBoard, 
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
  function addBoard(event) {
    event.preventDefault();
    const idDate = new Date();
    const newBoard = document.getElementById("board-title-input").value;
    const defaultTask = {
      title: `Set up your first task for ${newBoard}`,
      decription: "",
      status: "todo",
      id: idDate,
      board: newBoard,
    };
    createNewTask(defaultTask);
    refreshTasksUI();
    event.target.reset();
    toggleModal(false, elements.createNewBoardModal);
    fetchAndDisplayBoardsAndTasks();
  }


function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div'); // Get the sidebar element
  const showSidebarBtn = document.getElementById('show-side-bar-btn');

  if (show) {
    sidebar.style.display = 'block';  // Show the sidebar if 'show' is true
    showSidebarBtn.style.display = 'none'; // Hide the show button when sidebar is visible
    localStorage.setItem('showSideBar', 'true'); // Save state
  } else {
    sidebar.style.display = 'none';   // Hide the sidebar if 'show' is false
    showSidebarBtn.style.display = 'block'; // Show button when sidebar is hidden
    localStorage.setItem('showSideBar', 'false'); // Save state
  }
}
document.getElementById('hide-side-bar-btn').addEventListener("click", () => toggleSidebar(false));
document.getElementById('show-side-bar-btn').addEventListener("click", () => toggleSidebar(true));

// Ensure the sidebar state is applied on page load
document.addEventListener("DOMContentLoaded", function () {
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
});


function toggleTheme() {
  const body = document.body;
  const themeSwitch = document.getElementById('switch'); // Checkbox input for theme toggle
  const isLightMode = themeSwitch.checked;
  
  if (isLightMode) {
    body.classList.add('light-theme');  
    localStorage.setItem('theme', 'light'); 
  } else {
    body.classList.remove('light-theme');  
    localStorage.setItem('theme', 'dark');
  }

  // Toggle theme icons
  document.getElementById('icon-dark').style.display = isLightMode ? 'none' : 'block';
  document.getElementById('icon-light').style.display = isLightMode ? 'block' : 'none';
}

// Apply saved theme on page load

document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem('theme');
  const themeSwitch = document.getElementById('switch');

  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeSwitch.checked = true;
    document.getElementById('icon-dark').style.display = 'none';
    document.getElementById('icon-light').style.display = 'block';
  } else {
    document.body.classList.remove('light-theme');
    themeSwitch.checked = false;
    document.getElementById('icon-dark').style.display = 'block';
    document.getElementById('icon-light').style.display = 'none';
  }

  // Attach event listener to the theme switch
  themeSwitch.addEventListener('change', toggleTheme);
});

let saveChangesListener = null;
let deleteTaskListener = null;

function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById("edit-task-title-input").value = task.title;
  document.getElementById("edit-task-desc-input").value = task.description;
  document.getElementById("edit-select-status").value = task.status;
  const taskId = task.id;
  // Get button elements from the task modal
  const btnModalElements = {
    saveTask: document.getElementById("save-task-changes-btn"),
    deleteTask: document.getElementById("delete-task-btn"),
  };

  // removes event listners if there are pre existing

  if (saveChangesListener !== null) {
    btnModalElements.saveTask.removeEventListener("click", saveChangesListener);
  }

  if (deleteTaskListener !== null) {
    btnModalElements.deleteTask.removeEventListener("click", deleteTaskListener);
  }

  // Define new event listener functions
  saveChangesListener = () => saveTaskChanges(taskId);
  deleteTaskListener = () => {
    deleteTask(taskId);
    refreshTasksUI();
    fetchAndDisplayBoardsAndTasks();
    toggleModal(false, elements.editTaskModal);
  };

  // Add event listeners
  btnModalElements.saveTask.addEventListener("click", saveChangesListener);
  btnModalElements.deleteTask.addEventListener("click", deleteTaskListener);

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}
  
function saveTaskChanges(taskId) {
  // Get new user inputs
  const title = document.getElementById("edit-task-title-input").value;
  const description = document.getElementById("edit-task-desc-input").value;
  const status = document.getElementById("edit-select-status").value;
  // Create an object with the updated task details
  const updates = {
    title,
    description,
    status,
  };

  // Update task using a hlper functoin
  patchTask(taskId, updates);
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  if (showSidebar === true) {
    document.getElementById("dropDownIcon").src =
      "./assets/icon-chevron-up.svg";
  } else {
    document.getElementById("dropDownIcon").src =
      "./assets/icon-chevron-down.svg";
  }
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  const logo = document.getElementById("logo");
  if (logo) {
    logo.src = isLightTheme
      ? "./assets/logo-light.svg"
      : "./assets/logo-dark.svg";
  }

  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks //
}