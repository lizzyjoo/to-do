import Task from "./task";
import Project from "./project";
import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';

import {
    isToday,
    isTomorrow,
    isYesterday,
    isPast,
    isWithinInterval,
    formatDistanceToNow,
    parseISO,
    startOfDay,
    startOfWeek,
    endOfWeek
  } from 'date-fns'

// Define project IDs for special cases
const TASK_IDS = {
    TODAY: '2',
    UPCOMING: '3',
    ANYTIME: '4',
    COMPLETED: '5',
    OVERDUE: '6'
  }

class UI{
    static initialize() {
        //localStorage.clear();
        this.domElements();
        this.addEventListeners();
        this.loadStorageProjects();
        this.populateTaskForm()
    }

    static domElements() {
        this.addTaskBtn = document.getElementById("addTaskBtn");
        this.taskModal = document.getElementById("task-modal");
        this.taskForm = document.querySelector(".task-form");
        this.taskModalClose = document.getElementById("close-task");
        this.taskSection = document.querySelector(".task-section");
        this.dueDateInput = document.querySelector("#task-due");
        this.anytimeCheck = document.querySelector("#anytime");
        this.sidebar = document.querySelector(".sidebar");

        this.addProjectBtn = document.getElementById("addProjectBtn");
        this.projectModal = document.getElementById("project-modal");
        this.projectForm = document.querySelector(".project-form");
        this.projectModalClose = document.getElementById("close-project");
        this.projectList = document.querySelector(".project-list");
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        
    }

    static addEventListeners() {
        this.addTaskBtn.addEventListener("click", () => this.displayTaskModal());
        this.taskModalClose.addEventListener("click", () => this.closeTaskModal());
        this.taskForm.addEventListener("submit", (event) => this.handleTaskFormSubmit(event));
        this.anytimeCheck.addEventListener("change", () => this.handleAnytimeCheckbox());
        this.dueDateInput.addEventListener("input", ()=>this.handleDueInput());
        this.addProjectBtn.addEventListener("click", () => this.displayProjectModal());
        this.projectModalClose.addEventListener("click", () => this.closeProjectModal());
        this.projectForm.addEventListener("submit", (event)=>this.handleProjectFormSubmit(event));
       
        
        this.closeModalBtns.forEach((closeModalBtn) => {
            closeModalBtn.addEventListener('click', () =>
              this.resetForm(closeModalBtn)
            )
          });
        
    }
    // if the user checks the 'anytime' for the due date, disable the date input
    static handleAnytimeCheckbox() {
        if (this.anytimeCheck.checked) {
            this.dueDateInput.value = '';
            this.dueDateInput.disabled = true;
          } else {
            this.dueDateInput.disabled = false;
          }
    }

    static handleDueInput() {
        if (this.dueDateInput.value) {
            this.anytimeCheck.checked = false;
            this.anytimeCheck.disabled = true;
          } else {
            this.anytimeCheck.disabled = false;
          }
    }
    static displayProjectModal() {
        this.projectModal.style.display = "block";
    }

    static displayTaskModal() {
        this.taskModal.style.display = "block";
    }


    static closeProjectModal() { 
        this.projectModal.style.display = "none";
    }

    static closeTaskModal() {
        this.taskModal.style.display = "none";
    }

    
    static createTask(form, id = uuidv4()){
        return new Task(
            form.querySelector("#task-content").value,
            form.querySelector("#priority").value,
            form.querySelector("#task-due").value,
            form.querySelector('#anytime').checked,
            form.querySelector("#parent-project").value,
            id
        )
    }

    static createProject(form, id = uuidv4()){
        return new Project(
            form.querySelector("#project-title-input").value,
            form.querySelector("#project-description-input").value,
            id
        )
    }

    // create new project if project form inputs are valid
    static handleProjectFormSubmit(event) {
        event.preventDefault();
        if (this.projectForm.checkValidity()) {
            // create new project object
            const newProject = this.createProject(this.projectForm);
            // store new project to local storage
            Storage.addProject(newProject);
            this.resetForm(
                this.projectForm.closest('.project-modal').querySelector('.close-modal')
            );

            this.closeProjectModal();
            this.loadStorageProjects();
            // add the project to one of the dropdown options in the add task form
            this.addProjectToTaskForm(newProject);
        } 
        
    }

    // handle task form submission 
    static handleTaskFormSubmit(event) {
        event.preventDefault();
        if (this.taskForm.checkValidity()) {
            // create new task object
            const newTask = this.createTask(this.taskForm);
            const taskParent = newTask.parentProject; // 1 for inbox
            
            // 1. what project is it in? just Inbox or specific project

            // store new project to local storage
            Storage.addTasktoProject(newTask,taskParent);// task object, name (string) of parent
            this.resetForm(
                this.taskForm.closest('.task-modal').querySelector('.close-modal')
            );

            this.closeTaskModal();
            this.loadTasks(newTask.parentProject);
        } 

    }

  
    
    static loadTasks(projectID) {
        // add the task to the apporpriate task 
        const project = Storage.getProject(projectID);
        const incompleteTasks = [];
        const completedTasks = [];
        project.tasks.forEach((task) => {
            if (task.completed) {
              completedTasks.push(task)
            } else {
              incompleteTasks.push(task)
            }
          })
        // Append incomplete tasks first, then completed tasks
        incompleteTasks.forEach((task) => this.createTaskDiv(task));
        completedTasks.forEach((task) => this.createTaskDiv(task));


      
    }
    static loadStorageProjects () {
        this.projectList.innerHTML = '';
        const projects = Storage.getProjects();
        projects.forEach((project) => {
            if (!['1', '2', '3', '4', '5', '6'].includes(project.id)) {
              this.createProjectDiv(project)
            }
          })
    }

    static addProjectToTaskForm(project){
        //this.taskForm
        const taskFormProjectOption = document.createElement("option");
        taskFormProjectOption.value = project.id;
        taskFormProjectOption.textContent = project.title;

        const taskFormParentProject = this.taskForm.querySelector("#parent-project");
        taskFormParentProject.appendChild(taskFormProjectOption);
    }

    static populateTaskForm() {
        const projects = Storage.loadProjects();
        projects.forEach(project => {
            this.addProjectToTaskForm(project);
        });
    }
    
    static createTaskDiv(task){
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        const taskCheckBox = document.createElement("input");
        taskCheckBox.type = "checkbox";
        
        // task details
        const taskDetailDiv = document.createElement("div");
        taskDetailDiv.classList.add("task-detail");

        // task name
        const taskContent = task.content;

        // div for task labels
        const taskLabels = document.createElement("div");
        taskLabels.classList.add("task-labels");

        const taskDueDiv = document.createElement("div");
        taskDueDiv.classList.add("task-due-div");
        const taskDue = task.due;
        taskDueDiv.textContent = taskDue;

        const taskPriorityDiv = document.createElement("div");
        taskPriorityDiv.classList.add("task-priority-div");
        const taskPriority = task.priority;
        taskPriorityDiv.textContent = taskPriority;

        const taskProjectDiv = document.createElement("div");
        taskProjectDiv.classList.add("task-project-div");
        const taskProject = task.parentProject;
        taskProjectDiv.textContent = taskProject;

        taskLabels.appendChild(taskDueDiv);
        taskLabels.appendChild(taskPriorityDiv);
        taskLabels.appendChild(taskProjectDiv);

        taskDetailDiv.appendChild(taskContent);
        taskDetailDiv.appendChild(taskLabels);

        taskItem.appendChild(taskCheckBox);
        taskItem.appendChild(taskDetailDiv);
        return taskItem;
    }

    static createProjectDiv(project){
        const projectItem = document.createElement("div");
        projectItem.classList.add("project-item");

        const hashtag = document.createElement("p");
        hashtag.classList.add("project-hashtag");
        hashtag.textContent = "#";
        

        const projectTitleP = document.createElement("p");
        projectTitleP.classList.add("project-title-p");
        projectTitleP.textContent = project.title;
        
        
        const projectItemDiv = document.createElement("div");
        projectItemDiv.classList.add("project-item-div");
        projectItemDiv.appendChild(hashtag);
        projectItemDiv.appendChild(projectTitleP);
        projectItem.appendChild(projectItemDiv);

        // div for project menu drop down button
        const projectDropDown = document.createElement("div");
        projectDropDown.classList.add("project-dropdown");
        // button
        const optionBtn = document.createElement("button");
        optionBtn.classList.add("project-option");
        projectDropDown.appendChild(optionBtn);

        // drop down content
        const dropDownContent = document.createElement("div");
        dropDownContent.classList.add("project-dropdown-content");
        dropDownContent.id = "dropdown-content";
        const editOption = document.createElement("p");
        editOption.textContent = "Edit";
        editOption.classList.add("edit-option");
        const deleteOption = document.createElement("p");
        deleteOption.textContent = "Delete";
        deleteOption.classList.add("delete-option");
        dropDownContent.appendChild(editOption);
        dropDownContent.appendChild(deleteOption);

        projectDropDown.appendChild(dropDownContent);
        projectItem.appendChild(projectDropDown);
        // 1. event listener for the project name div: once clicked, page will load project details
        projectItemDiv.addEventListener("click", () => this.loadProjectPage(project));
        // 2. event listener for project option button
        optionBtn.addEventListener("click", () => {
            dropDownContent.classList.toggle("show");
            optionBtn.classList.toggle("clicked");
            
        });
        // event listeners to handle project edit and delete option
        editOption.addEventListener("click", ()=>this.handleEditOption(project, projectItemDiv));
        deleteOption.addEventListener("click", ()=> this.handleDeleteOption(project,projectItemDiv));
    
        // if user clicks anywhere else on the window, close
        window.onclick = function(event) {
            
            if (!event.target.matches(".project-option")) {
                // a more efficient way to do this??
                let btns = document.getElementsByClassName("project-option");
                let k;
                for (k = 0; k < btns.length; k++) {
                    let btn = btns[k];
                    if (btn.classList.contains('clicked')) {
                    btn.classList.remove('clicked');
                    }
                }
                let dropdowns = document.getElementsByClassName("project-dropdown-content");
                let i;
                for (i = 0; i < dropdowns.length; i++) {
                    let openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                    }
                }
   
            }
        }
        this.projectList.appendChild(projectItem);

    }
    
    static resetForm(closeModalBtn) {
        const modal = closeModalBtn.closest('.project-modal') || closeModalBtn.closest('.task-modal') || closeModalBtn.closest('.project-edit-modal');
        if (modal) {
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    static handleEditOption(project, projectItemDiv) {
        const projectEditModal = document.createElement("div");
        projectEditModal.classList.add("project-edit-modal");
        projectEditModal.style.display = "block";
        const projectEditModalContent = document.createElement("div");
        projectEditModalContent.classList.add("project-modal-content");

        projectEditModal.appendChild(projectEditModalContent);

        const modalHeader = document.createElement("div");
        modalHeader.classList.add("modal-header");
        const modalHeaderH2 = document.createElement("h2");
        modalHeaderH2.textContent = "Edit Project";
        modalHeader.appendChild(modalHeaderH2);
        

        const modalCloseSpan = document.createElement("span");
        modalCloseSpan.classList.add("close-modal");
        modalCloseSpan.textContent = "\u00D7";
        modalHeader.appendChild(modalCloseSpan);

        projectEditModalContent.appendChild(modalHeader);
        // project edit form
        const projectEditForm = document.createElement("form");
        projectEditForm.classList.add("project-form");

        const projectTitleEdit = document.createElement("input");
        projectTitleEdit.type = "text";
        projectTitleEdit.classList.add("project-form-input");
        projectTitleEdit.id = "project-title-edit";
        projectTitleEdit.value = project.title;
        projectEditForm.appendChild(projectTitleEdit);

        const projectDescriptionEdit = document.createElement("input");
        projectDescriptionEdit.type = "text";
        projectDescriptionEdit.classList.add("project-form-input");
        projectDescriptionEdit.id = "project-description-edit";
        projectDescriptionEdit.value = project.description;
        projectEditForm.appendChild(projectDescriptionEdit);

        const projectEditSubmit = document.createElement("input");
        projectEditSubmit.type = "submit";
        projectEditSubmit.classList.add("project-submit");
        projectEditSubmit.value = "Edit Project";
        projectEditForm.appendChild(projectEditSubmit);

        projectEditModalContent.appendChild(projectEditForm);
        projectEditModal.appendChild(projectEditModalContent);
        this.sidebar.appendChild(projectEditModal);

        modalCloseSpan.addEventListener('click', () =>{
            this.resetForm(modalCloseSpan);
            projectEditModal.style.display = "none";
        });
        // add event listner to form for form submit; update project
        projectEditForm.addEventListener("submit", (event) => {this.handleEditFormSubmit(event,projectEditForm,projectItemDiv, project)});


    }

    // handle project edit form 
    static handleEditFormSubmit(event, projectEditForm, projectItemDiv, project){
        event.preventDefault();
        
        if (projectEditForm.checkValidity()){
            // edit UI
            const originalTitle = projectItemDiv.querySelector(".project-title-p");
            const newTitle = projectEditForm.querySelector("#project-title-edit").value;
            const newDescription = projectEditForm.querySelector("#project-description-edit").value;
            originalTitle.textContent = newTitle;
            // also update project info in storage
            Storage.editProject(project.id, newTitle, newDescription);
            this.resetForm(
                projectEditForm.closest('.project-edit-modal').querySelector('.close-modal')
            );
            projectEditForm.closest('.project-edit-modal').style.display = "none";
        }
    }

    // delete project from local storage as well as the UI
    static handleDeleteOption(project, projectItemDiv) {
        // modal to confirm deletion here (optional)
        // delete from storage
        Storage.deleteProject(project.id);
        projectItemDiv.remove();
    }
    static loadProjectPage(project) {
        // project page header
        const projPageHeader = document.createElement("div");
        projPageHeader.classList.add("page-header");
        // project title
        const projPageTitle = document.createElement("div");
        projPageTitle.classList.add("project-header-title");
        projPageTitle.textContent = project.title;
        projPageHeader.appendChild(projPageTitle);
        // project description
        const projPageDescription = document.createElement("div");
        projPageDescription.classList.add("project-header-description");
        projPageDescription.textContent = project.description;
        projPageHeader.appendChild(projPageDescription);
        this.taskSection.appendChild(projPageHeader);

        // create div to contain tasks 
        const projPageTaskList = document.createElement("div");
        projPageTaskList.classList.add("project-header-tasks");
        this.taskSection.appendChild(projPageTaskList);

       // button to add task to this specific project 
        // loop through all the project items? then return taskitem div? then append those to the tasklist div
        project.tasks.forEach((task) => {
            projPageTaskList.appendChild(this.createTaskDiv(task));
        })


    }
}

export default UI;